// To define unlock rules and layout.
// change "threshold" for diff the unlocking requirement (3600 = 1 hr)

/* note on how to change assets position
the grid structure is as such
(0,0)    (0,1)    (0,2)    (0,3)    (0,4)
(1,0)    ...                        (1,4)
...
(4,0)    (4,1)    (4,2)    (4,3)    (4,4)

-> alter 'row' and 'col' to shift assets
*/

export interface EraAsset {
  name: string;
  image: any;
  threshold: number; // seconds
  row: number;
  col: number;
}

export const egyptEraAssets: EraAsset[] = [
  {
    name: "cactus1",
    image: require("@/assets/images/ancient-egypt-assets/cactus-1.png"),
    threshold: 1110,
    row: 0,
    col: 2,
  },
  {
    name: "cactus2",
    image: require("@/assets/images/ancient-egypt-assets/cactus-2.png"),
    threshold: 150,
    row: 0,
    col: 1,
  },
  {
    name: "cactus3",
    image: require("@/assets/images/ancient-egypt-assets/cactus-3.png"),
    threshold: 400,
    row: 0,
    col: 3,
  },

  {
    name: "camel",
    image: require("@/assets/images/ancient-egypt-assets/camel.png"),
    threshold: 800,
    row: 1,
    col: 1,
  },

  {
    name: "house1",
    image: require("@/assets/images/ancient-egypt-assets/house-1.png"),
    threshold: 120,
    row: 1,
    col: 3,
  },
  {
    name: "house2",
    image: require("@/assets/images/ancient-egypt-assets/house-2.png"),
    threshold: 200,
    row: 1,
    col: 4,
  },
  {
    name: "house3",
    image: require("@/assets/images/ancient-egypt-assets/house-3.png"),
    threshold: 300,
    row: 2,
    col: 0,
  },

  {
    name: "pet",
    image: require("@/assets/images/ancient-egypt-assets/pet.png"),
    threshold: 50,
    row: 4,
    col: 2,
  },

  {
    name: "pyramid1",
    image: require("@/assets/images/ancient-egypt-assets/pyramid-1.png"),
    threshold: 500,
    row: 2,
    col: 2,
  },
  {
    name: "pyramid2",
    image: require("@/assets/images/ancient-egypt-assets/pyramid-2.png"),
    threshold: 700,
    row: 2,
    col: 3,
  },
  {
    name: "pyramid3",
    image: require("@/assets/images/ancient-egypt-assets/pyramid-3.png"),
    threshold: 900,
    row: 2,
    col: 4,
  },

  {
    name: "shop1",
    image: require("@/assets/images/ancient-egypt-assets/shop-1.png"),
    threshold: 350,
    row: 3,
    col: 0,
  },
  {
    name: "shop2",
    image: require("@/assets/images/ancient-egypt-assets/shop-2.png"),
    threshold: 600,
    row: 3,
    col: 1,
  },
  {
    name: "shop3",
    image: require("@/assets/images/ancient-egypt-assets/shop-3.png"),
    threshold: 950,
    row: 3,
    col: 3,
  },

  {
    name: "sphinx1",
    image: require("@/assets/images/ancient-egypt-assets/sphinx-1.png"),
    threshold: 180,
    row: 4,
    col: 1,
  },
  {
    name: "sphinx2",
    image: require("@/assets/images/ancient-egypt-assets/sphinx-2.png"),
    threshold: 550,
    row: 4,
    col: 3,
  },
  {
    name: "sphinx3",
    image: require("@/assets/images/ancient-egypt-assets/sphinx-3.png"),
    threshold: 1000,
    row: 4,
    col: 4,
  },

  {
    name: "tent1",
    image: require("@/assets/images/ancient-egypt-assets/tent-1.png"),
    threshold: 60,
    row: 3,
    col: 4,
  },
  {
    name: "tent2",
    image: require("@/assets/images/ancient-egypt-assets/tent-2.png"),
    threshold: 220,
    row: 4,
    col: 0,
  },
  {
    name: "tent3",
    image: require("@/assets/images/ancient-egypt-assets/tent-3.png"),
    threshold: 420,
    row: 2,
    col: 1,
  },
];
