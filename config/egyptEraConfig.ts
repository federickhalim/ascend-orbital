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
    name: "cactus",
    image: require("@/assets/images/desert-town/cactus.png"),
    threshold: 5,
    row: 0,
    col: 0,
  },
  {
    name: "building1",
    image: require("@/assets/images/desert-town/building1.png"),
    threshold: 30,
    row: 1,
    col: 0,
  },
  {
    name: "camel",
    image: require("@/assets/images/desert-town/camel.png"),
    threshold: 1080,
    row: 3,
    col: 1,
  },
  {
    name: "building2",
    image: require("@/assets/images/desert-town/building2.png"),
    threshold: 50,
    row: 0,
    col: 3,
  },
  {
    name: "pet",
    image: require("@/assets/images/desert-town/pet.png"),
    threshold: 60,
    row: 4,
    col: 2,
  },
  {
    name: "sphinx",
    image: require("@/assets/images/desert-town/sphinx.png"),
    threshold: 70,
    row: 3,
    col: 2,
  },
  {
    name: "pyramid",
    image: require("@/assets/images/desert-town/pyramid.png"),
    threshold: 80,
    row: 2,
    col: 3,
  },
];
