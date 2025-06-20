import { ImageSourcePropType } from "react-native";

export type EraAsset = {
  name: string;
  images: {
    [level: number]: ImageSourcePropType;
  };
  top: number;
  left: number;
};

export const egyptEraAssets: EraAsset[] = [
  {
    name: "pyramid",
    images: {
      1: require("@/assets/images/ancient-egypt-assets/pyramid-1.png"),
      2: require("@/assets/images/ancient-egypt-assets/pyramid-2.png"),
      3: require("@/assets/images/ancient-egypt-assets/pyramid-3.png"),
    },
    top: 95,
    left: 70,
  },
  {
    name: "tent",
    images: {
      1: require("@/assets/images/ancient-egypt-assets/tent-1.png"),
      2: require("@/assets/images/ancient-egypt-assets/tent-2.png"),
      3: require("@/assets/images/ancient-egypt-assets/tent-3.png"),
    },
    top: 100,
    left: 250,
  },
  {
    name: "shop",
    images: {
      1: require("@/assets/images/ancient-egypt-assets/shop-1.png"),
      2: require("@/assets/images/ancient-egypt-assets/shop-2.png"),
      3: require("@/assets/images/ancient-egypt-assets/shop-3.png"),
    },
    top: 120,
    left: 190,
  },
  {
    name: "house",
    images: {
      1: require("@/assets/images/ancient-egypt-assets/house-1.png"),
      2: require("@/assets/images/ancient-egypt-assets/house-2.png"),
      3: require("@/assets/images/ancient-egypt-assets/house-3.png"),
    },
    top: 65,
    left: 160,
  },
  {
    name: "sphinx",
    images: {
      1: require("@/assets/images/ancient-egypt-assets/sphinx-1.png"),
      2: require("@/assets/images/ancient-egypt-assets/sphinx-2.png"),
      3: require("@/assets/images/ancient-egypt-assets/sphinx-3.png"),
    },
    top: 110,
    left: 120,
  },
  {
    name: "cactus",
    images: {
      1: require("@/assets/images/ancient-egypt-assets/cactus-1.png"),
      2: require("@/assets/images/ancient-egypt-assets/cactus-2.png"),
      3: require("@/assets/images/ancient-egypt-assets/cactus-3.png"),
    },
    top: 100,
    left: 150,
  },
  {
    name: "camel",
    images: {
      1: require("@/assets/images/ancient-egypt-assets/camel.png"),
      2: require("@/assets/images/ancient-egypt-assets/camel.png"),
      3: require("@/assets/images/ancient-egypt-assets/camel.png"),
    },
    top: 90,
    left: 200,
  },
  {
    name: "pet",
    images: {
      1: require("@/assets/images/ancient-egypt-assets/pet.png"),
      2: require("@/assets/images/ancient-egypt-assets/pet.png"),
      3: require("@/assets/images/ancient-egypt-assets/pet.png"),
    },
    top: 138,
    left: 150,
  },
];

export const egyptBase = require("@/assets/images/ancient-egypt-assets/desert-base.png");
