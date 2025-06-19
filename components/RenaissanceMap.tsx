import React, { useEffect, useRef, useState } from "react";
import { View, Image, Animated, StyleSheet, Easing } from "react-native";
import { renaissanceEraAssets, renaissanceBase } from "@/config/renaissanceEraConfig";
import { RENAISSANCE_START, SECONDS_PER_LEVEL, LEVELS_PER_ERA } from "@/config/eraThresholdConfig";

interface RenaissanceMapProps {
  totalFocusTime: number;
}

const MAX_MAP_WIDTH = 320;
const ASSET_SIZE = 200;
const HALF_SIZE = ASSET_SIZE / 2;

export default function RenaissanceMap({ totalFocusTime }: RenaissanceMapProps) {
  const [prevEraLevel, setPrevEraLevel] = useState(1);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const relativeFocusTime = totalFocusTime - RENAISSANCE_START;
  const cappedTime = Math.max(relativeFocusTime, 0);
  const level = Math.floor(cappedTime / SECONDS_PER_LEVEL);
  const eraLevel = Math.min(level + 1, LEVELS_PER_ERA);

  useEffect(() => {
    if (eraLevel > prevEraLevel) {
      setPrevEraLevel(eraLevel);

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
  }, [eraLevel]);

  const tiles = [];

  tiles.push(
    <Image
      key="base"
      source={renaissanceBase}
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

  renaissanceEraAssets.forEach((asset) => {
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
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
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
