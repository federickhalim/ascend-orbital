import { Asset } from "expo-asset";
import { egyptEraAssets, egyptBase } from "@/config/egyptEraConfig";
import { renaissanceEraAssets, renaissanceBase } from "@/config/renaissanceEraConfig";
import { futureEraAssets, futureBase } from "@/config/futureEraConfig";

export async function preloadAssets() {
  const assetModules = [
    // Bases
    egyptBase,
    renaissanceBase,
    futureBase,

    // Ancient assets
    ...egyptEraAssets.flatMap((asset) => Object.values(asset.images)),

    // Renaissance assets
    ...renaissanceEraAssets.flatMap((asset) => Object.values(asset.images)),

    // Future assets
    ...futureEraAssets.flatMap((asset) => Object.values(asset.images)),
  ];

  await Asset.loadAsync(assetModules);
}
