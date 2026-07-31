#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

const canonicalPath = arg("--canonical");
const templatePath = arg("--template");
const outputPath = arg("--out");
if (!canonicalPath || !templatePath || !outputPath) {
  console.error(
    "Usage: derive-img2threejs-spec.mjs --canonical FILE --template FILE --out FILE",
  );
  process.exit(2);
}

const canonical = JSON.parse(await readFile(canonicalPath, "utf8"));
const spec = JSON.parse(await readFile(templatePath, "utf8"));
const detailInventory = JSON.parse(
  await readFile(
    "assets/workbench/field-plough-01/detail-inventory.json",
    "utf8",
  ),
);
const referenceCameraEvidence = JSON.parse(
  await readFile(
    "assets/workbench/field-plough-01/reference-camera.json",
    "utf8",
  ),
).referenceCamera;

const rgba = (hex) => {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((x) => x + x)
          .join("")
      : value;
  return `rgba(${parseInt(full.slice(0, 2), 16)}, ${parseInt(full.slice(2, 4), 16)}, ${parseInt(full.slice(4, 6), 16)}, 1.0)`;
};

const primitiveFor = (component) => {
  const role = `${component.role} ${component.id}`.toLowerCase();
  if (component.id === "attachment-frame") return "curve-sweep";
  if (component.id === "hydraulic-ram") return "tube";
  if (component.id === "cutting-edge-group") return "extrude";
  if (component.topology.class === "continuous-sculpt") return "extrude";
  if (component.topology.class === "surface-relief") return "cylinder";
  if (component.topology.class === "material-only") return "plane-card";
  if (
    role.includes("hydraulic") ||
    role.includes("pin") ||
    role.includes("hitch")
  )
    return "cylinder";
  if (role.includes("share")) return "extrude";
  return "box";
};

const dimensionsFor = (component) => {
  const d = component.dimensions ?? {};
  const presets = {
    "top-link-bracket": { width: 0.8, height: 0.3, depth: 0.28 },
    "lower-left-hitch": { width: 0.3, height: 0.5, depth: 0.38 },
    "lower-right-hitch": { width: 0.3, height: 0.5, depth: 0.38 },
    "cross-beam": { width: 3.0, height: 0.28, depth: 0.3 },
    "brace-left": { width: 0.16, height: 1.0, depth: 0.16 },
    "brace-right": { width: 0.16, height: 1.0, depth: 0.16 },
    "share-left": { width: 0.82, height: 0.86, depth: 0.24 },
    "share-center": { width: 0.82, height: 0.86, depth: 0.24 },
    "share-right": { width: 0.82, height: 0.86, depth: 0.24 },
    "fastener-groups": { width: 0.16, height: 0.16, depth: 0.16 },
    "cutting-edge-group": { width: 2.8, height: 0.08, depth: 0.12 },
    "rust-wear-group": { width: 2.8, height: 0.12, depth: 0.32 },
    "soil-residue-group": { width: 2.8, height: 0.16, depth: 0.42 },
    "hinge-pin-group": { width: 0.14, height: 0.14, depth: 0.55 },
  };
  const preset = presets[component.id] ?? {
    width: 0.2,
    height: 0.2,
    depth: 0.2,
  };
  return {
    width: Number(d.width ?? d.length ?? d.radius ?? preset.width),
    height: Number(d.height ?? d.radius ?? preset.height),
    depth: Number(d.depth ?? d.radius ?? preset.depth),
    units: "relative",
    confidence: Number(d.confidence ?? 0.35),
  };
};

const componentById = new Map(
  canonical.components.map((component) => [component.id, component]),
);
const materialById = new Map(
  canonical.materials.map((material) => [material.id, material]),
);

function colorRecipe(materialId) {
  const material = materialById.get(materialId) ?? canonical.materials[0];
  return {
    dominantAlbedo: rgba(material.pbr.baseColor.dominant),
    secondaryAlbedo: rgba(
      material.pbr.baseColor.secondary?.[0] ?? material.pbr.baseColor.dominant,
    ),
    materialClass: materialId === "soil-residue" ? "stone" : "metal",
    materialClassConfidence: 0.82,
    colorGradient: {
      type: "linear",
      stops: [
        { position: 0, color: rgba(material.pbr.baseColor.dominant) },
        {
          position: 1,
          color: rgba(
            material.pbr.baseColor.secondary?.at(-1) ??
              material.pbr.baseColor.dominant,
          ),
        },
      ],
    },
    evidenceRefs: ["primary-reference"],
  };
}

function componentSpec(component) {
  const materialId = component.materials[0] ?? "painted-steel";
  const pivot = component.pivot?.localPosition ?? [0, 0, 0];
  const parent = component.parent;
  const sockets = (component.sockets ?? []).map((socket) => ({
    id: socket.id,
    localPosition: socket.position,
    localRotation: [0, 0, 0],
    role: socket.role,
  }));
  const semanticAttachment = parent
    ? {
        parentId: parent,
        parentSocket: `${parent}-socket`,
        localStart: pivot,
        localEnd: [pivot[0], pivot[1] + 0.1, pivot[2] - 0.1],
        contactType: component.role.includes("share") ? "embedded" : "hinge",
        overlap: 0.05,
        gapTolerance: 0.01,
        evidenceRefs: ["primary-reference"],
      }
    : null;
  // The external factory's review tree intentionally uses a flat world-frame
  // parent so authored positions remain readable. Keep the canonical parent in
  // actionProfile.attachmentContract, while the tool-facing attachment contract
  // names the derived render-tree parent for validator consistency.
  const attachment = semanticAttachment
    ? { ...semanticAttachment, parentId: "root" }
    : null;
  // Preserve the canonical macro/meso/micro hierarchy and complete attachment
  // contract in the derived spec. The repo-owned factory preparation step
  // disables endpoint-cylinder replacement for visual review while retaining
  // this semantic data for validation and later adapter work.
  const geometryDescriptor = {
    topologyIntent: component.topology.primitiveStrategy,
    edgeTreatment: {
      type: "chamfer",
      bevelRadius: component.level === "micro" ? 0.01 : 0.04,
      segments: 2,
    },
    deformationStack: component.id.includes("share")
      ? ["curved-profile", "edge-wear"]
      : [],
    uvStrategy: "generated procedural coordinates with object-scale projection",
    normalStrategy:
      "vertex normals plus independent reference-derived or procedural normal response",
  };
  if (component.id === "attachment-frame") {
    geometryDescriptor.curveSweep = {
      spine: [
        [-0.5, 0.0, 0.0],
        [0.0, 0.9, 0.0],
        [0.5, 0.0, 0.0],
      ],
      crossSection: {
        points: [
          [-0.045, -0.045],
          [0.045, -0.045],
          [0.045, 0.045],
          [-0.045, 0.045],
        ],
      },
      closed: false,
    };
  }
  if (component.id === "hydraulic-ram") {
    geometryDescriptor.tubePath = {
      points: [
        [0.0, 0.0, 0.0],
        [0.0, 0.7, 0.0],
      ],
      radius: 0.5,
      radialSegments: 16,
      closed: false,
    };
  }
  if (component.id.includes("share")) {
    geometryDescriptor.profile2D = {
      points: [
        [-0.5, -0.42],
        [-0.43, 0.35],
        [-0.16, 0.5],
        [0.35, 0.38],
        [0.5, 0.04],
        [0.25, -0.2],
        [-0.1, -0.44],
      ],
      depth: 0.24,
    };
    geometryDescriptor.helicoidalSurface = {
      handedness: "consistent soil throw toward implement left",
      sectionCount: 9,
      longitudinalSegments: 28,
      transverseSegments: 24,
      sectionProfiles: [
        {
          station: 0,
          width: 0.52,
          sweep: -0.12,
          concavity: 0.22,
          twistDegrees: -8,
        },
        {
          station: 0.5,
          width: 0.76,
          sweep: -0.02,
          concavity: 0.3,
          twistDegrees: 10,
        },
        {
          station: 1,
          width: 0.48,
          sweep: 0.16,
          concavity: 0.2,
          twistDegrees: 24,
        },
      ],
      lowerTransition:
        "continuous tangent into the forward cutting-share plate without a visible air gap",
      failureModes: [
        "bilaterally symmetric paddle silhouette",
        "flat extruded plate",
        "detached centered cutting triangle",
      ],
    };
  }
  if (component.id === "cutting-edge-group") {
    geometryDescriptor.profile2D = {
      points: [
        [-0.52, -0.06],
        [0.5, 0.01],
        [0.02, 0.18],
        [-0.4, 0.12],
      ],
      depth: 0.11,
    };
    geometryDescriptor.integration = {
      count: 4,
      projection: "forward from each moldboard lower leading edge",
      edgeContinuity:
        "lower cutting edge remains visually continuous into its moldboard",
      staggering:
        "each share follows the same depth-staggered order as the four moldboards",
    };
  }
  return {
    id: component.id,
    name: component.role,
    level: component.level,
    semanticLevel: component.level,
    role: component.role,
    importance:
      component.level === "macro"
        ? 0.95
        : component.level === "meso"
          ? 0.8
          : 0.65,
    confidence: 0.72,
    primitive: primitiveFor(component),
    topologyClass: component.topology.class,
    topologyRationale: `Observed ${component.topology.class} evidence in the isolated field-plough reference; ${component.topology.primitiveStrategy}.`,
    geometryDescriptor,
    semanticParent: parent,
    parent: component.id === "root" ? null : "root",
    attachment,
    dimensions: dimensionsFor(component),
    transform: { position: pivot, rotation: [0, 0, 0], scale: [1, 1, 1] },
    actionProfile: {
      animationRole: component.action.animationRole,
      pivot: {
        mode: component.pivot.mode,
        localPosition: pivot,
        axis: component.pivot.axis,
        confidence: 0.65,
      },
      attachmentContract: semanticAttachment,
      transformChannels: {
        translate: false,
        rotate: true,
        scale: false,
        bend: false,
        twist: false,
        detach: component.action.detachable,
        visibility: true,
        materialState: true,
      },
      sockets,
      collider: {
        type: component.collider.type,
        offset: [0, 0, 0],
        scale: [1, 1, 1],
        isTrigger: component.collider.isTrigger,
        notes: component.collider.authority,
      },
      constraints: component.action.states.map((state) => ({
        state,
        source: "canonical asset definition",
      })),
      destruction: {
        breakable: component.action.detachable,
        fractureGroup: component.id,
        seamRefs: component.localFeatures,
        detachableFragments: component.action.detachable ? [component.id] : [],
        breakImpulse: 0,
        debrisMaterial: materialId,
      },
    },
    material: materialId,
    materialLayers: component.materials,
    deformations: [],
    joints: sockets.map((socket) => ({
      id: socket.id,
      type: "hinge-or-socket",
      parent: component.id,
    })),
    seams: component.localFeatures.filter(
      (feature) => feature.includes("seam") || feature.includes("rust"),
    ),
    localFeatures: component.localFeatures,
    colorMaterialRecipe: colorRecipe(materialId),
    surfaceDetail: {
      macroRoughness: 0.78,
      microRoughness: 0.18,
      bumpAmplitude: 0.32,
      normalPattern: "independent material normal",
      displacementPattern: "localized wear where silhouette permits",
      occlusionPattern: "cavity and contact AO",
      edgeWearPattern: "paint loss on exposed edges",
      notes: "Derived from the canonical material and detail definition.",
    },
    evidenceRefs: ["primary-reference"],
    details: component.localFeatures,
    fidelityTier: component.level === "macro" ? "blockout" : "structural",
  };
}

function generatedMaterial(material) {
  const pbr = material.pbr;
  const isHero = material.id === "painted-steel";
  const maps = isHero
    ? Object.fromEntries(
        [
          [
            "albedo",
            "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_albedo.png",
          ],
          [
            "roughness",
            "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_roughness.png",
          ],
          [
            "height",
            "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_height.png",
          ],
          [
            "normal",
            "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_normal.png",
          ],
          [
            "ao",
            "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_ao.png",
          ],
        ].map(([channel, path]) => [channel, { path, channel }]),
      )
    : null;
  return {
    id: material.id,
    name: material.layer,
    type: "standard",
    qualityTier: isHero ? "hero" : "utility",
    shaderModel: "MeshStandardMaterial / PBR approximation",
    baseColor: pbr.baseColor.dominant,
    color: pbr.baseColor.dominant,
    albedo: {
      dominant: pbr.baseColor.dominant,
      secondary: pbr.baseColor.secondary,
      samplingNotes:
        "Canonical asset definition; source pixels remain evidence, not measured truth.",
    },
    colorVariation: {
      palette: [pbr.baseColor.dominant, ...pbr.baseColor.secondary],
      pattern: "localized procedural variation",
      amplitude: 0.2,
      heightCorrelation: 0.35,
    },
    textureResolution: 1024,
    textureProjection: {
      mode: "uv",
      repeat: [2, 2],
      anisotropy: 8,
      texelDensityIntent: "Stable object-scale detail",
    },
    surfaceFrequencyBands: [
      { id: "macro", frequency: 2, amplitude: 0.42, role: "broad breakup" },
      { id: "meso", frequency: 12, amplitude: 0.22, role: "wear and seams" },
      {
        id: "micro",
        frequency: 56,
        amplitude: 0.08,
        role: "grazing-light breakup",
      },
    ],
    roughness: {
      base: pbr.roughness.base,
      variation: pbr.roughness.variation,
      map: pbr.roughness.map,
    },
    metalness: { base: pbr.metalness, variation: 0.08 },
    normal: {
      pattern: pbr.normal.map,
      strength: pbr.normal.strength,
      scale: 24,
      space: "tangent",
    },
    bump: { pattern: pbr.height, amplitude: 0.2, scale: 1 },
    displacement: {
      pattern: pbr.height,
      amplitude: 0.04,
      scale: 1,
      silhouetteAffects: false,
    },
    ambientOcclusion: {
      cavityStrength: pbr.ao.strength,
      contactShadowBias: 0.35,
      notes: "Independent cavity and contact response",
    },
    wear: {
      edgeWear: 0.45,
      scratches: material.localOverrides.filter((item) =>
        ["scratch", "chip"].includes(item.kind),
      ),
      chips: material.localOverrides.filter((item) => item.kind === "chip"),
    },
    dirt: {
      amount: material.id === "soil-residue" ? 0.9 : 0.28,
      cavityBias: 0.7,
      color: pbr.baseColor.dominant,
    },
    localOverrides: material.localOverrides.map((override) => ({
      ...override,
      ...(override.kind === "gloss"
        ? { roughness: 0.18, clearcoat: 0.35 }
        : {}),
    })),
    referencePbr: isHero
      ? {
          version: "1",
          sourceImage: canonical.references[0].path,
          extractor: "extract_pbr_evidence.py",
          method: "reference-derived pixel evidence",
          verdict: "usable for derived material pass",
          hardLimit: "not inverse rendering",
          usable: true,
          confidence: 0.86,
          estimatedFidelity: 0.86,
          targetThreshold: 0.7,
          maps,
        }
      : undefined,
    shaderNotes: [
      "Keep albedo, roughness, height, normal, and AO independent.",
      "Do not turn visual texture into collision or gameplay authority.",
    ],
  };
}

const components = canonical.components.map(componentSpec);
const ids = new Set(components.map((component) => component.id));
// The review factory is an assembled candidate, so the blockout pass includes
// every authored component even when the semantic component level is meso or
// micro. This is a tool-facing visibility choice, not a claim that every part
// has macro fidelity. Keep semantic depth in `level` and expose all parts for
// open-world inspection from the first useful procedural build.
spec.buildPasses = (spec.buildPasses ?? []).map((pass) =>
  pass.id === "blockout"
    ? { ...pass, componentRefs: components.map((component) => component.id) }
    : pass,
);
spec.repetitionSystems = (spec.repetitionSystems ?? []).map((system) => ({
  ...system,
  level: "macro",
  semanticLevel: system.level ?? "meso",
}));
const featureRef = (detail) => {
  const raw = detail.mapsTo?.ref ?? "root";
  const direct = raw.split("/")[0];
  if (ids.has(direct)) return direct;
  if (raw.includes("cross-beam")) return "cross-beam";
  if (raw.includes("hydraulic")) return "hydraulic-ram";
  if (raw.includes("share") || raw.includes("soil")) return "share-assembly";
  if (raw.includes("hitch") || raw.includes("link")) return "attachment-frame";
  return raw.includes("steel") ? "painted-steel" : "root";
};

spec.targetName = canonical.displayName;
spec.targetId = canonical.assetId;
spec.schemaVersion = "2.1";
spec.sourceImage = canonical.references[0].path;
spec.suitability = "conditional";
spec.referenceCamera = {
  solved: false,
  method: referenceCameraEvidence.method,
  fovDegrees: referenceCameraEvidence.fovDegrees.value,
  aspect: referenceCameraEvidence.aspect.value,
  orientation: {
    yaw: referenceCameraEvidence.orientation.yawDegrees.value,
    pitch: referenceCameraEvidence.orientation.pitchDegrees.value,
    roll: referenceCameraEvidence.orientation.rollDegrees.value,
  },
  positionHint: referenceCameraEvidence.position.hint,
  confidence: referenceCameraEvidence.confidence,
  agentFill: {
    orientation: true,
    framing: true,
  },
  silhouetteAlignmentTargets: {
    subjectOccupancy: "match reference crop before geometry acceptance",
    scaleDeltaMax: 0.08,
    aspectRatioDeltaMax: 0.05,
    silhouetteIoUMin: 0.85,
  },
  note: "Heuristic starting camera only. The blockout remains refine-spec until overlay review aligns the crop, scale, and identity landmarks.",
};
spec.preSpecAssessment = {
  ...(spec.preSpecAssessment ?? {}),
  objectClass: {
    primaryType: "object",
    primaryDomain: "object",
    formLanguage: ["hard-surface", "mechanical", "agricultural"],
    structureKind: [
      "compound object",
      "articulated assembly",
      "repeated modules",
    ],
    motionPotential: ["articulated", "detachable", "whole-object transform"],
    materialFamilies: [
      "painted metal",
      "bare metal",
      "rust",
      "soil-like residue",
    ],
    notes:
      "Derived from canonical field-plough asset definition and isolated reference.",
  },
  complexity: {
    tier: "complex",
    scores: {
      silhouetteComplexity: 2,
      componentCount: 3,
      hierarchyDepth: 3,
      repetitionDensity: 2,
      materialLayerCount: 3,
      localDetailDensity: 3,
      occlusionRisk: 2,
      actionReadinessNeed: 3,
    },
    estimatedCounts: {
      macroComponents: 3,
      mesoComponents: 8,
      microFeatureGroups: 5,
      materialLayers: 4,
      repetitionSystems: 2,
    },
    reasoning: [
      "Wide attachment frame, hydraulic actuator, repeated shares, fasteners, and localized wear require a deep action-ready hierarchy.",
    ],
  },
  detailInventory: {
    ...detailInventory.detailInventory,
    details: detailInventory.detailInventory.details.map((detail) => ({
      ...detail,
      mapsTo: { ...detail.mapsTo, ref: featureRef(detail) },
      evidenceRef: detail.evidenceRef.replace(
        "/Users/pranay/Projects/Game_dev/rigs-unbound/",
        "",
      ),
    })),
  },
};
spec.qualityContract = {
  ...(spec.qualityContract ?? {}),
  qualityBar: "complex",
  minimumSpecDepth: {
    macroComponents: 3,
    mesoComponents: 8,
    microFeatureGroups: 5,
    materialLayers: 4,
    repetitionSystems: 1,
    reviewViewpoints: 4,
  },
  definitionOfDone: [
    "The field-plough reads as the observed attachment frame, hydraulic actuator, repeated share system, cutting edges, and worn-soil material assembly from all required review viewpoints.",
  ],
  featureGroups: [
    {
      id: "attachment-system",
      name: "Three-point attachment and pivot system",
      required: true,
      qualityCriteria: [
        "Top link, lower hitch points, pins, and sockets remain separately addressable and physically connected.",
      ],
      evidenceRefs: ["primary-reference"],
      failureModes: ["floating hitch, merged attachment, or missing socket"],
    },
    {
      id: "share-system",
      name: "Repeated share and cutting-edge system",
      required: true,
      qualityCriteria: [
        "Exactly four depth-staggered share assemblies preserve the observed lower rhythm.",
        "Each moldboard is a handed helicoidal shell with a narrow standard connection, broader swept trailing edge, concave soil-turning face, and consistent soil-throw direction.",
        "Each narrow forward-projecting cutting share transitions continuously into its moldboard lower edge without a detached centered triangle.",
      ],
      evidenceRefs: ["primary-reference"],
      failureModes: [
        "generic blade bar or wrong repetition count",
        "bilaterally symmetric paddle moldboards",
        "flat plates without longitudinal twist",
        "detached centered cutting triangles",
        "four identical ornaments suspended without depth staggering or load paths",
      ],
    },
    {
      id: "worn-material-system",
      name: "Worn painted steel, exposed metal, rust, and soil",
      required: true,
      qualityCriteria: [
        "Independent PBR response and localized wear remain readable under neutral and grazing light.",
      ],
      evidenceRefs: ["painted-steel-pbr", "primary-reference"],
      failureModes: ["flat plastic material or globally painted grime"],
    },
  ],
  visualDeltaChecks: [
    "attachment silhouette and negative space",
    "share count and spacing",
    "handed helicoidal moldboard profile and twist",
    "integrated cutting-share transition",
    "reference-camera crop, subject occupancy, and landmark alignment",
    "hydraulic endpoint alignment",
    "independent material response",
    "soil-contact and wear locality",
  ],
  antiShallowSpecRules: [
    "Every image-derived detail must map to a component or material override.",
    "No factory generation before strict validation.",
  ],
};
spec.componentTree = components;
spec.materials = canonical.materials.map(generatedMaterial);
spec.repetitionSystems = canonical.repetitionSystems.map((system) => ({
  id: system.id,
  semanticLevel: "meso",
  level: "macro",
  parent: system.id.includes("share") ? "share-assembly" : "cross-beam",
  primitive: system.id.includes("share") ? "extrude" : "cylinder",
  material: system.id.includes("share") ? "bare-steel" : "rust",
  count: system.count,
  placement: { mode: "linear", axis: [1, 0, 0], radius: 0, startAngleDeg: 0 },
  instanceScale: system.id.includes("share")
    ? [0.55, 0.65, 0.18]
    : [0.08, 0.08, 0.08],
  distribution: system.distribution,
  evidenceRefs: ["primary-reference"],
}));
spec.featureReviewTargets = [
  {
    id: "field-plough-silhouette",
    name: "Field plough silhouette and negative-space system",
    tier: "critical",
    passIds: ["blockout"],
    minimumScore: 0.8,
    mustPass: true,
    componentRefs: ["root", "attachment-frame", "share-assembly"],
    evidenceRefs: ["primary-reference"],
  },
  {
    id: "three-point-attachment",
    name: "Three-point attachment, hitch pins, and hydraulic alignment",
    tier: "critical",
    passIds: ["blockout", "structural-pass", "form-refinement"],
    minimumScore: 0.8,
    mustPass: true,
    componentRefs: [
      "attachment-frame",
      "top-link-bracket",
      "lower-left-hitch",
      "lower-right-hitch",
      "hydraulic-ram",
    ],
    evidenceRefs: ["primary-reference"],
  },
  {
    id: "repeated-share-system",
    name: "Repeated curved shares and bright cutting edges",
    tier: "critical",
    passIds: ["structural-pass", "form-refinement"],
    minimumScore: 0.8,
    mustPass: true,
    componentRefs: [
      "share-assembly",
      "share-left",
      "share-center",
      "share-right",
      "cutting-edge-group",
    ],
    evidenceRefs: ["primary-reference"],
  },
  {
    id: "worn-material-system",
    name: "Worn painted steel, rust, exposed metal, and soil residue",
    tier: "critical",
    passIds: ["material-pass", "surface-pass", "lighting-pass"],
    minimumScore: 0.75,
    mustPass: true,
    componentRefs: ["root", "rust-wear-group", "soil-residue-group"],
    evidenceRefs: ["primary-reference", "painted-steel-pbr"],
  },
];
spec.lightingFromPhoto = [
  {
    role: "key light",
    description:
      "large warm upper-left studio key defining beam and share bevels",
  },
  {
    role: "fill light",
    description:
      "soft cool frontal fill preserving dark cavities and hitch separation",
  },
  {
    role: "rim light",
    description:
      "subtle rear rim separating the top-link triangle and share silhouettes",
  },
  {
    role: "environment",
    description:
      "warm light-gray background, ACES tone mapping, exposure near neutral, grounded contact shadow and ambient occlusion",
  },
];
spec.qualityTargets = {
  ...(spec.qualityTargets ?? {}),
  targetFidelity: 0.7,
  reviewViewpoints: [
    "front-three-quarter",
    "rear-three-quarter",
    "side",
    "underside-attachment-close-up",
  ],
  mustMatch: [
    "attachment silhouette and sockets",
    "repeated share system",
    "hydraulic pivot",
    "independent painted-steel PBR response",
    "soil and wear locality",
  ],
};
spec.viewEvidence = [
  {
    id: "primary-reference",
    view: "front-left-three-quarter",
    imageRegion: { x: 0, y: 0, width: 1, height: 1, units: "normalized" },
    observations: canonical.identity.silhouette.identityFeatures,
    confidence: 0.82,
  },
  {
    id: "painted-steel-pbr",
    view: "material-crop-grid",
    imageRegion: {
      x: 0.05,
      y: 0.3,
      width: 0.9,
      height: 0.55,
      units: "normalized",
    },
    observations: [
      "worn painted steel",
      "rust patches",
      "soil residue",
      "exposed cutting edges",
    ],
    confidence: 0.86,
  },
];
spec.actionReadiness = {
  contract:
    "Every action-critical plough component is a named pivot with sockets, attachment metadata, simplified collider intent, and state metadata.",
  defaultRigType: "action-ready-rig-part",
  rootMotionNode: "root",
  requiredComponentFields: [
    "id",
    "parent",
    "transform",
    "attachment",
    "actionProfile.pivot",
    "actionProfile.sockets",
    "actionProfile.collider",
  ],
  transformChannels: ["rotate", "visibility", "material-state", "detach"],
  authoringRules: [
    "Simulation owns collision and terrain-tool authority.",
    "Visual components remain separate from gameplay colliders.",
    "Attached parts use endpoint-based local geometry.",
  ],
  destructionPolicy: {
    defaultBreakable: false,
    fractureGroupNaming: "semantic component IDs",
    debrisStrategy: "detachable groups only",
  },
};
spec.coordinateFrame = canonical.coordinateFrame;
spec.proceduralStrategy = [
  "Build named macro pivots first.",
  "Use profile extrudes or curve sweeps for curved shares, never box stacks.",
  "Use instanced systems for repeated shares and fasteners.",
  "Keep visual meshes, sockets, and collision metadata separate.",
];
spec.assumptions = canonical.identity.uncertainties;
spec.reviewHistory ??= [];
spec.sculptPipeline ??= {
  passGateMode: "locked-sequential",
  passOrder: [
    "blockout",
    "structural-pass",
    "form-refinement",
    "material-pass",
    "surface-pass",
    "lighting-pass",
    "interaction-pass",
    "optimization-pass",
  ],
  currentPass: "blockout",
  completedPasses: [],
  lastCompletedPass: "",
  blockedReason: "blockout requires browser screenshot and comparison review",
  nextRequiredEvidence: [
    "blockout render screenshot",
    "comparison sheet",
    "AI vision score >= 0.7",
    "critical feature scores",
    "reviewHistory continue entry",
  ],
};
await writeFile(outputPath, `${JSON.stringify(spec, null, 2)}\n`);
console.log(`Derived ${outputPath} from ${canonicalPath}`);
