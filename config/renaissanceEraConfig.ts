import { ImageSourcePropType } from "react-native";

export type EraAsset = {
  name: string;
  images: {
    [level: number]: ImageSourcePropType;
  };
  top: number;
  left: number;
};

export const renaissanceEraAssets: EraAsset[] = [
  {
    name: "cathedral",
    images: {
      1: require("@/assets/images/renaissance-assets/cathedral-1.png"),
      2: require("@/assets/images/renaissance-assets/cathedral-2.png"),
      3: require("@/assets/images/renaissance-assets/cathedral-3.png"),
    },
    top: 90,
    left: 78,
  },
  {
    name: "palazzo",
    images: {
      1: require("@/assets/images/renaissance-assets/palazzo-1.png"),
      2: require("@/assets/images/renaissance-assets/palazzo-2.png"),
      3: require("@/assets/images/renaissance-assets/palazzo-3.png"),
    },
    top: 100,
    left: 250,
  },
  {
    name: "alchemy",
    images: {
      1: require("@/assets/images/renaissance-assets/alchemy-1.png"),
      2: require("@/assets/images/renaissance-assets/alchemy-2.png"),
      3: require("@/assets/images/renaissance-assets/alchemy-3.png"),
    },
    top: 118,
    left: 192,
  },
  {
    name: "library",
    images: {
      1: require("@/assets/images/renaissance-assets/library-1.png"),
      2: require("@/assets/images/renaissance-assets/library-2.png"),
      3: require("@/assets/images/renaissance-assets/library-3.png"),
    },
    top: 60,
    left: 160,
  },
  {
    name: "clocktower",
    images: {
      1: require("@/assets/images/renaissance-assets/clocktower-1.png"),
      2: require("@/assets/images/renaissance-assets/clocktower-2.png"),
      3: require("@/assets/images/renaissance-assets/clocktower-3.png"),
    },
    top: 110,
    left: 120,
  },
  {
    name: "observatory",
    images: {
      1: require("@/assets/images/renaissance-assets/observatory-1.png"),
      2: require("@/assets/images/renaissance-assets/observatory-2.png"),
      3: require("@/assets/images/renaissance-assets/observatory-3.png"),
    },
    top: 98,
    left: 155,
  },
  {
    name: "griffin",
    images: {
      1: require("@/assets/images/renaissance-assets/griffin.png"),
      2: require("@/assets/images/renaissance-assets/griffin.png"),
      3: require("@/assets/images/renaissance-assets/griffin.png"),
    },
    top: 80,
    left: 200,
  },
  {
    name: "owl",
    images: {
      1: require("@/assets/images/renaissance-assets/owl.png"),
      2: require("@/assets/images/renaissance-assets/owl.png"),
      3: require("@/assets/images/renaissance-assets/owl.png"),
    },
    top: 138,
    left: 150,
  },
];
