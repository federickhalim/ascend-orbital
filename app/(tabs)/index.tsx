import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import dayjs from "dayjs";

type ModeType = "stopwatch" | "pomodoro";
type PomodoroPhase = "focus" | "break";

export default function HomeScreen() {
  const [mode, setMode] = useState<ModeType>("stopwatch");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("focus");

  // 🔹 New states for streak tracking
  const [streak, setStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState("");
  const [hasLoadedFromFirestore, setHasLoadedFromFirestore] = useState(false);

  const POMODORO_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;
  const userId = "demo-user";

  // 🔹 Load focus time and streak from Firestore
  useEffect(() => {
    const fetchFocusTime = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          console.log(
            "📥 Loaded totalFocusTime from Firestore:",
            data.totalFocusTime
          );
          setTotalFocusTime(data.totalFocusTime || 0);
          setStreak(data.streak || 0);
          setLastStudyDate(data.lastStudyDate || "");
        } else {
          console.log("📥 No document found. Starting fresh.");
        }

        setHasLoadedFromFirestore(true);
      } catch (error) {
        console.error("Error fetching focus time:", error);
      }
    };

    fetchFocusTime();
  }, []);

  // 🔹 Save to Firestore
  useEffect(() => {
    if (!hasLoadedFromFirestore) return;

    const saveFocusTime = async () => {
      try {
        console.log("✅ Saving totalFocusTime to Firestore:", totalFocusTime);
        const userRef = doc(db, "users", userId);
        await setDoc(
          userRef,
          {
            totalFocusTime,
            streak,
            lastStudyDate,
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error saving focus time:", error);
      }
    };

    saveFocusTime();
  }, [totalFocusTime, streak, lastStudyDate, hasLoadedFromFirestore]);

  const [remainingTime, setRemainingTime] = useState(POMODORO_DURATION);

  // 🔹 Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning) {
      interval = setInterval(() => {
        if (mode === "stopwatch") {
          setElapsedTime((prev) => prev + 1);
        } else {
          setRemainingTime((prev) => {
            if (prev <= 1) {
              clearInterval(interval); // Stop when countdown hits 0
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  // 🔹 Pomodoro auto-switch
  useEffect(() => {
    if (!isRunning || mode !== "pomodoro") return;

    const duration =
      pomodoroPhase === "focus" ? POMODORO_DURATION : BREAK_DURATION;

    if (remainingTime === 0) {
      if (pomodoroPhase === "focus") {
        setTotalFocusTime((prev) => prev + duration);
        updateStreak(); // ✅ Call streak updater here too
        setPomodoroPhase("break");
      } else {
        setPomodoroPhase("focus");
      }
      setElapsedTime(0);
    }
  }, [elapsedTime, isRunning, mode, pomodoroPhase]);

  // 🔹 Streak logic
  const updateStreak = () => {
    const today = dayjs().format("YYYY-MM-DD");

    if (lastStudyDate === today) {
      return; // already updated today
    }

    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

    if (lastStudyDate === yesterday) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(1); // reset
    }

    setLastStudyDate(today);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);

      if (mode === "stopwatch") {
        if (elapsedTime > 0) {
          setTotalFocusTime((prev) => prev + elapsedTime);
          updateStreak();
        }
      } else if (mode === "pomodoro" && pomodoroPhase === "focus") {
        const timeSpent = POMODORO_DURATION - remainingTime;
        setTotalFocusTime((prev) => prev + timeSpent);
        updateStreak();
      }
    } else {
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setPomodoroPhase("focus");
    if (mode === "pomodoro") {
      setRemainingTime(POMODORO_DURATION);
    }
  };

  const toggleMode = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setPomodoroPhase("focus");
    setRemainingTime(POMODORO_DURATION); // reset Pomodoro countdown
    setMode((prev) => (prev === "stopwatch" ? "pomodoro" : "stopwatch"));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Focus Mode:{" "}
        {mode === "stopwatch" ? "Stopwatch" : `Pomodoro (${pomodoroPhase})`}
      </Text>

      <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          Switch to {mode === "stopwatch" ? "Pomodoro" : "Stopwatch"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.timer}>
        {mode === "stopwatch"
          ? formatTime(elapsedTime)
          : formatTime(remainingTime)}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isRunning ? "Stop" : "Start"}
          onPress={handleStartStop}
          color={isRunning ? "#d9534f" : "#5cb85c"}
        />
        <View style={{ width: 20 }} /> {/* spacing between buttons */}
        <Button title="Reset" onPress={handleReset} color="#f0ad4e" />
      </View>

      <Text style={styles.totalLabel}>Total Focus Time:</Text>
      <Text style={styles.total}>{formatTime(totalFocusTime)}</Text>

      <Text style={styles.totalLabel}>Current Streak:</Text>
      <Text style={styles.total}>
        {streak} {streak === 1 ? "day" : "days"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  toggleButton: {
    marginBottom: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  toggleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  timer: {
    fontSize: 48,
    marginVertical: 20,
  },
  totalLabel: {
    fontSize: 16,
    marginTop: 30,
  },
  total: {
    fontSize: 28,
    color: "#555",
  },
});
