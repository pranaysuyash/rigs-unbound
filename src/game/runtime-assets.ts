import assetManifest from "../../assets/asset-manifest.json";
import { HOME_SITE } from "./world";

type AssetManifestEntry = {
  id: string;
  runtimePath: string | null;
  publicRuntimeApproved: boolean;
};

export interface RuntimeBridgeSpec {
  assetId: string;
  runtimeUrl: string;
  x: number;
  z: number;
  yaw: number;
  targetMaxDimension: number;
  fallbackWidth: number;
  fallbackHeight: number;
  fallbackDepth: number;
  fallbackColor: number;
}

const entries: readonly AssetManifestEntry[] = assetManifest.entries.map(
  (entry) => {
    if (
      typeof entry.id !== "string" ||
      !("publicRuntimeApproved" in entry) ||
      typeof entry.publicRuntimeApproved !== "boolean" ||
      !(entry.runtimePath === null || typeof entry.runtimePath === "string")
    ) {
      throw new Error(
        "Asset manifest runtime entries require id, runtimePath, and publicRuntimeApproved.",
      );
    }
    return {
      id: entry.id,
      runtimePath: entry.runtimePath,
      publicRuntimeApproved: entry.publicRuntimeApproved,
    };
  },
);

type RuntimeBridgePresentation = Omit<
  RuntimeBridgeSpec,
  "assetId" | "runtimeUrl"
>;

const RUNTIME_BRIDGE_PRESENTATIONS: Readonly<
  Record<string, RuntimeBridgePresentation>
> = {
  "kenney-car-kit-breakable-crate-fixture": {
    x: HOME_SITE.x + 5.5,
    z: HOME_SITE.z + 3.25,
    yaw: -0.34,
    targetMaxDimension: 1.65,
    fallbackWidth: 1.4,
    fallbackHeight: 1.2,
    fallbackDepth: 1.4,
    fallbackColor: 0x8f6548,
  },
  "kenney-car-kit-tractor-preview": {
    x: HOME_SITE.x - 10.5,
    z: HOME_SITE.z + 7.5,
    yaw: 0.24,
    targetMaxDimension: 4.2,
    fallbackWidth: 2.8,
    fallbackHeight: 1.9,
    fallbackDepth: 4.8,
    fallbackColor: 0x75614b,
  },
};

export type RuntimeAssetSurface = "player" | "developer";

export function runtimeBridgeSpecs(
  surface: RuntimeAssetSurface,
): readonly RuntimeBridgeSpec[] {
  return entries
    .filter(
      (
        entry,
      ): entry is AssetManifestEntry & {
        runtimePath: string;
      } =>
        typeof entry.runtimePath === "string" &&
        entry.runtimePath.length > 0 &&
        (surface === "developer" || entry.publicRuntimeApproved === true),
    )
    .map((entry) => {
      const presentation = RUNTIME_BRIDGE_PRESENTATIONS[entry.id];
      if (!presentation) {
        throw new Error(
          `Runtime asset ${entry.id} has no asset-id-keyed presentation contract.`,
        );
      }
      return {
        assetId: entry.id,
        runtimeUrl: `/${entry.runtimePath.replace(/^\/+/, "")}`,
        ...presentation,
      };
    });
}
