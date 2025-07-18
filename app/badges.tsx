import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BadgesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Achievement Badges</Text>
      <Text>Your unlocked badges will show here!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
});
