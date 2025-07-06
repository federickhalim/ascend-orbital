import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

interface Props {
  onClose: () => void;
}

export default function SessionCompleteModal({ onClose }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.title}>🎉 Session Complete!</Text>
        <Text style={styles.text}>
          Good job staying focused for 25 minutes!
        </Text>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Stop Alarm & Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Confetti Animation */}
      <ConfettiCannon
        count={100}
        origin={{ x: 200, y: 0 }}
        fadeOut={true}
        fallSpeed={3000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    width: "80%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
