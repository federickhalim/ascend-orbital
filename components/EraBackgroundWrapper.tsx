import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { RENAISSANCE_START, FUTURE_START } from "@/config/eraThresholdConfig";
import { useFocusContext } from "@/context/FocusContext";

const eraBackgrounds = {
  ancient: require("@/assets/images/backgrounds/ancient-bg.png"),
  renaissance: require("@/assets/images/backgrounds/renaissance-bg.png"),
  future: require("@/assets/images/backgrounds/future-bg.png"),
};

function getEra(focusTime: number): keyof typeof eraBackgrounds {
  if (focusTime < RENAISSANCE_START) return "ancient";
  if (focusTime < FUTURE_START) return "renaissance";
  return "future";
}

export default function EraBackgroundWrapper({
  children,
  focusTime,
}: {
  children: React.ReactNode;
  focusTime?: number;
}) {
  const { liveFocusTime } = useFocusContext();
  const activeFocusTime = focusTime ?? liveFocusTime;
  const [currentEra, setCurrentEra] = useState(getEra(activeFocusTime));
  const [nextEra, setNextEra] = useState(currentEra);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const newEra = getEra(activeFocusTime);
    if (newEra !== currentEra) {
      setNextEra(newEra);
      fadeAnim.setValue(0);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250, // quick smooth fade
        useNativeDriver: true,
      }).start(() => {
        setCurrentEra(newEra);
      });
    }
  }, [activeFocusTime]);

  return (
    <View style={styles.container}>
      <Image
        source={eraBackgrounds[currentEra]}
        style={styles.background}
        resizeMode="cover"
      />
      {nextEra !== currentEra && (
        <Animated.Image
          source={eraBackgrounds[nextEra]}
          style={[styles.background, { opacity: fadeAnim }]}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
  },
});
