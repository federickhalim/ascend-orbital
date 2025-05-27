import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import dayjs from "dayjs";
import { useRouter } from "expo-router";

type ModeType = "stopwatch" | "pomodoro";
type PomodoroPhase = "focus" | "break";

export default function HomeScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<ModeType>("stopwatch");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [prevElapsedTime, setPrevElapsedTime] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("focus");
  const [prevRemainingTime, setPrevRemainingTime] = useState(25 * 60);

  const [streak, setStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState("");
  const [hasLoadedFromFirestore, setHasLoadedFromFirestore] = useState(false);

  const POMODORO_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;
  const userId = "demo-user";

  useEffect(() => {
    const fetchFocusTime = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          setTotalFocusTime(data.totalFocusTime || 0);
          setStreak(data.streak || 0);
          setLastStudyDate(data.lastStudyDate || "");
        }

        setHasLoadedFromFirestore(true);
      } catch (error) {
        console.error("Error fetching focus time:", error);
      }
    };

    fetchFocusTime();
  }, []);

  useEffect(() => {
    if (!hasLoadedFromFirestore) return;

    const saveFocusTime = async () => {
      try {
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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning) {
      interval = setInterval(() => {
        if (mode === "stopwatch") {
          setElapsedTime((prev) => prev + 1);
        } else {
          setRemainingTime((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode]);

  useEffect(() => {
    if (!isRunning || mode !== "pomodoro") return;

    const duration =
      pomodoroPhase === "focus" ? POMODORO_DURATION : BREAK_DURATION;

    if (remainingTime === 0) {
      if (pomodoroPhase === "focus") {
        setTotalFocusTime((prev) => prev + duration);
        updateStreak();
        setPomodoroPhase("break");
        setRemainingTime(BREAK_DURATION);
      } else {
        setPomodoroPhase("focus");
        setRemainingTime(POMODORO_DURATION);
      }
      setIsRunning(false);
    }
  }, [remainingTime, isRunning, mode, pomodoroPhase]);

  useEffect(() => {
    if (!hasLoadedFromFirestore || !lastStudyDate) return;
    const today = dayjs().format("YYYY-MM-DD");
    if (lastStudyDate !== today) {
      updateStreak();
    }
  }, [hasLoadedFromFirestore, lastStudyDate]);

  const updateStreak = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

    if (lastStudyDate === today) return;
    if (lastStudyDate === yesterday) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(1);
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
        const delta = elapsedTime - prevElapsedTime;
        if (delta > 0) {
          setTotalFocusTime((prev) => prev + delta);
          updateStreak();
        }
        setPrevElapsedTime(elapsedTime); // ✅ fix: update checkpoint
      } else if (mode === "pomodoro" && pomodoroPhase === "focus") {
        const timeSpent = prevRemainingTime - remainingTime;
        if (timeSpent > 0) {
          setTotalFocusTime((prev) => prev + timeSpent);
          updateStreak();
        }
        setPrevRemainingTime(remainingTime); // ✅ fix: update checkpoint
      }
    } else {
      if (mode === "stopwatch") {
        setPrevElapsedTime(elapsedTime);
      } else if (mode === "pomodoro") {
        setPrevRemainingTime(remainingTime);
      }
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setPrevElapsedTime(0);
    setPomodoroPhase("focus");
    if (mode === "pomodoro") {
      setRemainingTime(POMODORO_DURATION);
      setPrevRemainingTime(POMODORO_DURATION);
    }
  };

  const toggleMode = () => {
    setIsRunning(false);
    setPomodoroPhase("focus");
    setRemainingTime(POMODORO_DURATION);
    setPrevRemainingTime(POMODORO_DURATION);
    setElapsedTime(0);
    setPrevElapsedTime(0);
    setMode((prev) => (prev === "stopwatch" ? "pomodoro" : "stopwatch"));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

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
        <View style={{ width: 20 }} />
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
  backButton: {
    alignSelf: "flex-start",
    marginTop: 40,
    marginLeft: 20,
    padding: 8,
    backgroundColor: "#ddd",
    borderRadius: 5,
  },
  backText: {
    fontSize: 16,
    color: "#333",
  },
});
