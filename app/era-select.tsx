import { View, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import EraScroll from "@/components/EraScroll";
import { useLocalSearchParams } from "expo-router";
import EraBackgroundWrapper from "@/components/EraBackgroundWrapper";

export default function EraSelectScreen() {
  const { time } = useLocalSearchParams();
  const focusTime = parseInt(time as string) || 0;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <EraBackgroundWrapper>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <EraScroll totalFocusTimeInSeconds={focusTime} />
      </Animated.View>
    </EraBackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
});
