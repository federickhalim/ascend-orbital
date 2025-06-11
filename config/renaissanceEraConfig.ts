export interface EraAsset {
  name: string;
  image: any;
  threshold: number; // seconds
  row: number;
  col: number;
}

export const renaissanceEraAssets: EraAsset[] = [
  {
    name: "owl",
    image: require("@/assets/images/renaissance-assets/owl.png"),
    threshold: 3600000, // 1000h
    row: 2,
    col: 2,
  },
  {
    name: "alchemy1",
    image: require("@/assets/images/renaissance-assets/alchemy-1.png"),
    threshold: 4400000,
    row: 0,
    col: 1,
  },
  {
    name: "alchemy2",
    image: require("@/assets/images/renaissance-assets/alchemy-2.png"),
    threshold: 5200000,
    row: 1,
    col: 3,
  },
  {
    name: "alchemy3",
    image: require("@/assets/images/renaissance-assets/alchemy-3.png"),
    threshold: 6000000,
    row: 3,
    col: 1,
  },
  {
    name: "cathedral1",
    image: require("@/assets/images/renaissance-assets/cathedral-1.png"),
    threshold: 6800000,
    row: 1,
    col: 1,
  },
  {
    name: "cathedral2",
    image: require("@/assets/images/renaissance-assets/cathedral-2.png"),
    threshold: 7600000,
    row: 0,
    col: 3,
  },
  {
    name: "cathedral3",
    image: require("@/assets/images/renaissance-assets/cathedral-3.png"),
    threshold: 8400000,
    row: 4,
    col: 2,
  },
  {
    name: "clocktower1",
    image: require("@/assets/images/renaissance-assets/clocktower-1.png"),
    threshold: 9200000,
    row: 1,
    col: 0,
  },
  {
    name: "clocktower2",
    image: require("@/assets/images/renaissance-assets/clocktower-2.png"),
    threshold: 10000000,
    row: 2,
    col: 4,
  },
  {
    name: "clocktower3",
    image: require("@/assets/images/renaissance-assets/clocktower-3.png"),
    threshold: 10800000,
    row: 0,
    col: 0,
  },
  {
    name: "griffin",
    image: require("@/assets/images/renaissance-assets/griffin.png"),
    threshold: 11600000,
    row: 3,
    col: 3,
  },
  {
    name: "library1",
    image: require("@/assets/images/renaissance-assets/library-1.png"),
    threshold: 12400000,
    row: 2,
    col: 0,
  },
  {
    name: "library2",
    image: require("@/assets/images/renaissance-assets/library-2.png"),
    threshold: 13200000,
    row: 4,
    col: 1,
  },
  {
    name: "library3",
    image: require("@/assets/images/renaissance-assets/library-3.png"),
    threshold: 14000000,
    row: 3,
    col: 0,
  },
  {
    name: "observatory1",
    image: require("@/assets/images/renaissance-assets/observatory-1.png"),
    threshold: 14800000,
    row: 2,
    col: 3,
  },
  {
    name: "observatory2",
    image: require("@/assets/images/renaissance-assets/observatory-2.png"),
    threshold: 15600000,
    row: 1,
    col: 2,
  },
  {
    name: "observatory3",
    image: require("@/assets/images/renaissance-assets/observatory-3.png"),
    threshold: 16400000,
    row: 0,
    col: 4,
  },
  {
    name: "palazzo1",
    image: require("@/assets/images/renaissance-assets/palazzo-1.png"),
    threshold: 17200000,
    row: 3,
    col: 2,
  },
  {
    name: "palazzo2",
    image: require("@/assets/images/renaissance-assets/palazzo-2.png"),
    threshold: 17200000,
    row: 4,
    col: 3,
  },
  {
    name: "palazzo3",
    image: require("@/assets/images/renaissance-assets/palazzo-3.png"),
    threshold: 18000000, // 5000 hrs
    row: 1,
    col: 4,
  },
];
