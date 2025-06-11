import React from "react";
import { View, Image, StyleSheet, Animated, Easing } from "react-native";
import { useRef, useEffect } from "react";

import { renaissanceEraAssets } from "@/config/renaissanceEraConfig";

interface RenaissanceMapProps {
  totalFocusTime: number; // in seconds
}

const GRID_SIZE = 5;

export default function RenaissanceMap({
  totalFocusTime,
}: RenaissanceMapProps) {
  const MAX_MAP_WIDTH = 320;
  const TILE_WIDTH = MAX_MAP_WIDTH / GRID_SIZE;
  const TILE_HEIGHT = TILE_WIDTH / 2;
  const mapCenterOffsetX = (TILE_WIDTH * GRID_SIZE) / 2;

  // owl animation
  const owlFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(owlFloatAnim, {
          toValue: -6,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(owlFloatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    ).start();
  }, []);

  // griffin animation
  const griffinFloatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(griffinFloatAnim, {
          toValue: 6,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(griffinFloatAnim, {
          toValue: -6,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    ).start();
  }, []);

  const tiles = [];

  // Base tiles
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const top = (row + col) * (TILE_HEIGHT / 2);
      const left =
        (col - row) * (TILE_WIDTH / 2) + mapCenterOffsetX - TILE_WIDTH / 2;

      tiles.push(
        <Image
          key={`base-${row}-${col}`}
          source={require("@/assets/images/renaissance-assets/base2.png")}
          style={{
            position: "absolute",
            top: top - 0.5,
            left: left - 0.5,
            width: TILE_WIDTH + 1,
            height: TILE_HEIGHT + 1,
            zIndex: row + col,
          }}
        />
      );
    }
  }

  // Unlock assets
  renaissanceEraAssets.forEach((asset) => {
    if (totalFocusTime >= asset.threshold) {
      const ASSET_SCALE = 1.9;
      const top =
        (asset.row + asset.col) * (TILE_HEIGHT / 2) -
        TILE_HEIGHT * (ASSET_SCALE - 1);
      const left =
        (asset.col - asset.row) * (TILE_WIDTH / 2) -
        (TILE_WIDTH * (ASSET_SCALE - 1)) / 2 +
        mapCenterOffsetX -
        TILE_WIDTH / 2;

      const commonStyle = {
        position: "absolute" as const,
        top,
        left,
        width: TILE_WIDTH * ASSET_SCALE,
        height: TILE_HEIGHT * ASSET_SCALE,
        zIndex: asset.name === "owl" ? 101 : 100,
      };

      const isAnimated =
        (asset.name === "owl" || asset.name === "griffin") &&
        totalFocusTime >= 3600000;
      // change unlock renaissance era time acc

      tiles.push(
        isAnimated ? (
          <Animated.Image
            key={asset.name}
            source={asset.image}
            style={{
              ...commonStyle,
              transform:
                asset.name === "owl"
                  ? [{ translateY: owlFloatAnim }]
                  : [{ translateX: griffinFloatAnim }],
            }}
          />
        ) : (
          <Image key={asset.name} source={asset.image} style={commonStyle} />
        )
      );
    }
  });

  return (
    <View style={styles.mapWrapper}>
      <View
        style={{
          position: "relative",
          width: MAX_MAP_WIDTH,
          height: TILE_HEIGHT * GRID_SIZE * 2,
        }}
      >
        {tiles}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 0,
  },
});
