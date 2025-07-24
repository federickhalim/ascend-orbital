import React, { useEffect, useRef, useState } from "react";
import { Animated, View, StyleSheet, Easing } from "react-native";

interface EraTransitionWrapperProps {
  currentEra: "ancient" | "renaissance" | "future";
  children: React.ReactNode;
}

const MAP_HEIGHT = (320 * 3) / 4;
const ANIM_DURATION = 1200;
const FADE_DURATION = 600;

export default function EraTransitionWrapper({
  currentEra,
  children,
}: EraTransitionWrapperProps) {
  const [prevEra, setPrevEra] = useState(currentEra);

  const translateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const eraOrder = (era: "ancient" | "renaissance" | "future") => {
    switch (era) {
      case "ancient":
        return 0;
      case "renaissance":
        return 1;
      case "future":
        return 2;
    }
  };

  useEffect(() => {
    if (currentEra !== prevEra) {
      const goingForward = eraOrder(currentEra) > eraOrder(prevEra);

      // Animate new map
      translateAnim.setValue(goingForward ? -MAP_HEIGHT : MAP_HEIGHT);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: ANIM_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 🩹 Defer setState to avoid insertion effect warning
        requestAnimationFrame(() => {
          setPrevEra(currentEra);
        });
      });
    }
  }, [currentEra]);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.inner,
          {
            transform: [{ translateY: translateAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: MAP_HEIGHT,
    overflow: "hidden",
    alignItems: "center",
  },
  inner: {
    width: "100%",
    height: MAP_HEIGHT,
  },
});
