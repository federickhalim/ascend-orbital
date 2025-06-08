import React from "react";
import { View, Image, StyleSheet, Dimensions } from "react-native";
import { egyptEraAssets } from "@/config/egyptEraConfig";

interface AncientMapProps {
  totalFocusTime: number; // in seconds
}

const GRID_SIZE = 5;

const screenWidth = Dimensions.get("window").width;
const TILE_WIDTH = screenWidth / 6;
const TILE_HEIGHT = TILE_WIDTH / 2;

export default function AncientMap({ totalFocusTime }: AncientMapProps) {
  const tiles = [];

  // Add base tiles
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const top = (row + col) * (TILE_HEIGHT / 2) - 1;
      const left = (col - row) * (TILE_WIDTH / 2);

      tiles.push(
        <Image
          key={`base-${row}-${col}`}
          source={require("@/assets/images/desert-town/desertbase.png")}
          style={[
            styles.tile,
            {
              top,
              left,
              width: TILE_WIDTH,
              height: TILE_HEIGHT,
            },
          ]}
        />
      );
    }
  }

  // Add unlocked assets
  egyptEraAssets.forEach((asset) => {
    if (totalFocusTime >= asset.threshold) {
      const ASSET_SCALE = 1.9; // increase this to make assets larger

      const top =
        (asset.row + asset.col) * (TILE_HEIGHT / 2) -
        TILE_HEIGHT * (ASSET_SCALE - 1);
      const left =
        (asset.col - asset.row) * (TILE_WIDTH / 2) -
        (TILE_WIDTH * (ASSET_SCALE - 1)) / 2;

      tiles.push(
        <Image
          key={asset.name}
          source={asset.image}
          style={[
            styles.tile,
            {
              top,
              left,
              width: TILE_WIDTH * ASSET_SCALE,
              height: TILE_HEIGHT * ASSET_SCALE,
              zIndex: 1, // makes sure assets render above tiles
            },
          ]}
        />
      );
    }
  });

  return (
    <View style={styles.mapWrapper}>
      <View style={styles.map}>{tiles}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrapper: {
    height: 200,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    position: "relative",
    width: GRID_SIZE * TILE_WIDTH,
    height: GRID_SIZE * TILE_HEIGHT * 2,
  },
  tile: {
    position: "absolute",
  },
});
