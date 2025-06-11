import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  Animated,
  StyleSheet,
  useWindowDimensions,
  Easing,
} from "react-native";
import { egyptEraAssets } from "@/config/egyptEraConfig";

interface AncientMapProps {
  totalFocusTime: number; // in seconds
}

const GRID_SIZE = 5;
const MAX_MAP_WIDTH = 320;

export default function AncientMap({ totalFocusTime }: AncientMapProps) {
  const TILE_WIDTH = MAX_MAP_WIDTH / GRID_SIZE;
  const TILE_HEIGHT = TILE_WIDTH / 2;
  const mapCenterOffsetX = (TILE_WIDTH * GRID_SIZE) / 2;

  const [unlockedAssets, setUnlockedAssets] = useState<string[]>([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const newlyUnlocked = egyptEraAssets.filter(
      (asset) =>
        totalFocusTime >= asset.threshold &&
        !unlockedAssets.includes(asset.name)
    );

    if (newlyUnlocked.length > 0) {
      const newNames = newlyUnlocked.map((a) => a.name);
      setUnlockedAssets((prev) => [...prev, ...newNames]);

      // Reset animation values
      scaleAnim.setValue(0.3);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [totalFocusTime]);

  const tiles = [];

  // Render base tiles
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const top = (row + col) * (TILE_HEIGHT / 2);
      const left =
        (col - row) * (TILE_WIDTH / 2) + mapCenterOffsetX - TILE_WIDTH / 2;

      tiles.push(
        <Image
          key={`base-${row}-${col}`}
          source={require("@/assets/images/ancient-egypt-assets/desertbase-noGap.png")}
          style={{
            position: "absolute",
            top,
            left,
            width: TILE_WIDTH,
            height: TILE_HEIGHT,
            zIndex: row + col,
          }}
        />
      );
    }
  }

  // Render unlocked assets
  egyptEraAssets.forEach((asset) => {
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

      const isJustUnlocked = unlockedAssets.includes(asset.name);

      tiles.push(
        <Animated.Image
          key={asset.name}
          source={asset.image}
          style={{
            position: "absolute",
            top,
            left,
            width: TILE_WIDTH * ASSET_SCALE,
            height: TILE_HEIGHT * ASSET_SCALE,
            zIndex: 100,
            transform: [{ scale: isJustUnlocked ? scaleAnim : 1 }],
            opacity: isJustUnlocked ? opacityAnim : 1,
          }}
        />
      );
    }
  });

  return (
    <View style={styles.mapWrapper}>
      <View
        style={[
          styles.map,
          {
            width: MAX_MAP_WIDTH,
            height: TILE_HEIGHT * GRID_SIZE * 2,
          },
        ]}
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
  map: {
    position: "relative",
  },
});
