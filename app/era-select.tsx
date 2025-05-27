import { View, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import EraScroll from "@/components/EraScroll";
import useUserStats from "@/hooks/useUserStats";

export default function EraSelectScreen() {
  const userId = "demo-user";
  const { focusTime } = useUserStats(userId);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <EraScroll totalFocusTimeInSeconds={focusTime} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#f9f9f9",
  },
});
