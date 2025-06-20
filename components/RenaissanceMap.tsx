import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  Animated,
  StyleSheet,
  Easing,
} from "react-native";
import { renaissanceEraAssets } from "@/config/renaissanceEraConfig";
import { RENAISSANCE_START, SECONDS_PER_LEVEL } from "@/config/eraThresholdConfig";

interface RenaissanceMapProps {
  totalFocusTime: number;
}

const MAX_MAP_WIDTH = 320;
const ASSET_SIZE = 180; 
const HALF_SIZE = ASSET_SIZE / 2;

export default function RenaissanceMap({ totalFocusTime }: RenaissanceMapProps) {
  const [unlockedAssets, setUnlockedAssets] = useState<string[]>([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const relativeFocusTime = totalFocusTime - RENAISSANCE_START;
  const eraLevel = Math.min(3, Math.floor(relativeFocusTime / SECONDS_PER_LEVEL) + 1);

  useEffect(() => {
    const newlyUnlocked = renaissanceEraAssets.filter(
      (asset) =>
        !unlockedAssets.includes(asset.name) &&
        totalFocusTime >= SECONDS_PER_LEVEL
    );

    if (newlyUnlocked.length > 0) {
      const newNames = newlyUnlocked.map((a) => a.name);
      setUnlockedAssets((prev) => [...prev, ...newNames]);

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

  // Add base tile
  tiles.push(
    <Image
      key="base"
      source={require("@/assets/images/renaissance-assets/renaissance-base.png")}
      style={{
        width: MAX_MAP_WIDTH,
        height: (MAX_MAP_WIDTH * 3) / 4,
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
      }}
    />
  );

  // Render assets
  renaissanceEraAssets.forEach((asset) => {
    const isJustUnlocked = unlockedAssets.includes(asset.name);

    tiles.push(
      <Animated.Image
        key={asset.name}
        source={asset.images[eraLevel]}
        style={{
          position: "absolute",
          top: asset.top,
          left: asset.left,
          width: ASSET_SIZE,
          height: ASSET_SIZE,
          zIndex: 100,
          transform: [
            { translateX: -HALF_SIZE },
            { translateY: -HALF_SIZE },
            { scale: isJustUnlocked ? scaleAnim : 1 },
          ],
          opacity: isJustUnlocked ? opacityAnim : 1,
        }}
      />
    );
  });

  return (
    <View style={styles.mapWrapper}>
      <View
        style={{
          position: "relative",
          width: MAX_MAP_WIDTH,
          height: (MAX_MAP_WIDTH * 3) / 4,
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
