import { ImageSourcePropType } from "react-native";

export type EraAsset = {
  name: string;
  images: {
    [level: number]: ImageSourcePropType;
  };
  top: number;
  left: number;
};

export const futureEraAssets: EraAsset[] = [
  {
    name: "rocket",
    images: {
      1: require("@/assets/images/future-assets/rocket-1.png"),
      2: require("@/assets/images/future-assets/rocket-2.png"),
      3: require("@/assets/images/future-assets/rocket-3.png"),
    },
    top: 70,
    left: 100,
  },
  {
    name: "structure",
    images: {
      1: require("@/assets/images/future-assets/structure-1.png"),
      2: require("@/assets/images/future-assets/structure-2.png"),
      3: require("@/assets/images/future-assets/structure-3.png"),
    },
    top: 75,
    left: 255,
  },
  {
    name: "tower",
    images: {
      1: require("@/assets/images/future-assets/tower-1.png"),
      2: require("@/assets/images/future-assets/tower-2.png"),
      3: require("@/assets/images/future-assets/tower-3.png"),
    },
    top: 50,
    left: 160,
  },
  {
    name: "car",
    images: {
      1: require("@/assets/images/future-assets/car-1.png"),
      2: require("@/assets/images/future-assets/car-2.png"),
      3: require("@/assets/images/future-assets/car-3.png"),
    },
    top: 100,
    left: 120,
  },
  {
    name: "build",
    images: {
      1: require("@/assets/images/future-assets/build-1.png"),
      2: require("@/assets/images/future-assets/build-2.png"),
      3: require("@/assets/images/future-assets/build-3.png"),
    },
    top: 85,
    left: 200,
  },
  {
    name: "building",
    images: {
      1: require("@/assets/images/future-assets/building-1.png"),
      2: require("@/assets/images/future-assets/building-2.png"),
      3: require("@/assets/images/future-assets/building-3.png"),
    },
    top: 117,
    left: 165,
  },
];

export const futureBase = require("@/assets/images/future-assets/future-base.png");
