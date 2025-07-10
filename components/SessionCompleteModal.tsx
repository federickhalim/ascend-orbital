import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

interface Props {
  onOptionSelect: (option: "break" | "continue" | "stop") => void;
  isBreak?: boolean;
}

export default function SessionCompleteModal({
  onOptionSelect,
  isBreak,
}: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.title}>
          {isBreak ? "Break Ended!" : "🎉 Session Complete!"}
        </Text>
        <Text style={styles.text}>
          {isBreak
            ? "Time’s up! Ready for another Session?"
            : "Good job staying focused for 25 minutes!"}
        </Text>

        <View style={{ gap: 10 }}>
          {isBreak ? (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={() => onOptionSelect("continue")}
              >
                <Text style={styles.buttonText}>Start Another Pomodoro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => onOptionSelect("stop")}
              >
                <Text style={styles.buttonText}>End Session</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={() => onOptionSelect("break")}
              >
                <Text style={styles.buttonText}>Take 5-min Break</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => onOptionSelect("continue")}
              >
                <Text style={styles.buttonText}>Skip Break & Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => onOptionSelect("stop")}
              >
                <Text style={styles.buttonText}>End Session</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <ConfettiCannon
        count={isBreak ? 0 : 100}
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
