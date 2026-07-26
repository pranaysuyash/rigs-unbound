import { findSite } from "./world";

type RuntimeAssetPresentationContract = Omit<
  RuntimeBridgePresentation,
  "x" | "z"
> & {
  siteId: string;
  offsetX: number;
  offsetZ: number;
};

type AssetManifestEntry = {
  id: string;
  runtimePath: string | null;
  publicRuntimeApproved: boolean;
  runtimePresentation?: RuntimeAssetPresentationContract;
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

declare const __RUNTIME_ASSET_ENTRIES__: readonly AssetManifestEntry[];

const entries: readonly AssetManifestEntry[] = __RUNTIME_ASSET_ENTRIES__.map(
  (entry) => {
    if (
      typeof entry.id !== "string" ||
      !("publicRuntimeApproved" in entry) ||
      typeof entry.publicRuntimeApproved !== "boolean" ||
      !(entry.runtimePath === null || typeof entry.runtimePath === "string") ||
      (typeof entry.runtimePath === "string" &&
        (!entry.runtimePresentation ||
          typeof entry.runtimePresentation.siteId !== "string" ||
          entry.runtimePresentation.siteId.length === 0 ||
          !Object.entries(entry.runtimePresentation)
            .filter(([field]) => field !== "siteId")
            .every(
              ([, value]) =>
                typeof value === "number" && Number.isFinite(value),
            )))
    ) {
      throw new Error(
        "Asset manifest runtime entries require id, runtimePath, publicRuntimeApproved, and a finite presentation contract.",
      );
    }
    return {
      id: entry.id,
      runtimePath: entry.runtimePath,
      publicRuntimeApproved: entry.publicRuntimeApproved,
      runtimePresentation: entry.runtimePresentation,
    };
  },
);

type RuntimeBridgePresentation = Omit<
  RuntimeBridgeSpec,
  "assetId" | "runtimeUrl"
>;

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
      const presentation = entry.runtimePresentation;
      if (!presentation) {
        throw new Error(
          `Runtime asset ${entry.id} has no asset-id-keyed presentation contract.`,
        );
      }
      const site = findSite(presentation.siteId);
      if (!site) {
        throw new Error(
          `Runtime asset ${entry.id} references unknown site ${presentation.siteId}.`,
        );
      }
      return {
        assetId: entry.id,
        runtimeUrl: `/${entry.runtimePath.replace(/^\/+/, "")}`,
        x: site.x + presentation.offsetX,
        z: site.z + presentation.offsetZ,
        yaw: presentation.yaw,
        targetMaxDimension: presentation.targetMaxDimension,
        fallbackWidth: presentation.fallbackWidth,
        fallbackHeight: presentation.fallbackHeight,
        fallbackDepth: presentation.fallbackDepth,
        fallbackColor: presentation.fallbackColor,
      };
    });
}
