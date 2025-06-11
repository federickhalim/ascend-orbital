import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import AncientMap from "@/components/AncientMap";
import RenaissanceMap from "@/components/RenaissanceMap";

const router = useRouter();

type ModeType = "stopwatch" | "pomodoro";
type PomodoroPhase = "focus" | "break";

export default function HomeScreen() {
  const [mode, setMode] = useState<ModeType>("stopwatch");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [prevElapsedTime, setPrevElapsedTime] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("focus");
  const [prevRemainingTime, setPrevRemainingTime] = useState(25 * 60);
  const [remainingTime, setRemainingTime] = useState(25 * 60);

  const [streak, setStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState("");
  const [hasLoadedFromFirestore, setHasLoadedFromFirestore] = useState(false);

  const POMODORO_DURATION = 25 * 60;
  const BREAK_DURATION = 5 * 60;
  const userId = "demo-user";

  const floatAnim = useRef(new Animated.Value(0)).current;

  // this is for testing (uncomment and run only once!)
  /*
  useEffect(() => {
    const resetFocusTime = async () => {
      const userRef = doc(db, "users", "demo-user");
      await setDoc(
        userRef,
        {
          totalFocusTime: 1080, // change to '18000000' to view renaissance eras
        },
        { merge: true }
      );
      console.log("Focus time reset to 18 minutes");
    };

    resetFocusTime();
  }, []);
*/
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    ).start();
  }, []);

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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        if (mode === "stopwatch") {
          setElapsedTime((prev) => prev + 1);
        } else {
          setRemainingTime((prev) => (prev <= 1 ? 0 : prev - 1));
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
    if (lastStudyDate !== today) updateStreak();
  }, [hasLoadedFromFirestore, lastStudyDate]);

  const updateStreak = () => {
    const today = dayjs().format("YYYY-MM-DD");
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

    if (lastStudyDate === today) return;
    setStreak((prev) => (lastStudyDate === yesterday ? prev + 1 : 1));
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
        setPrevElapsedTime(elapsedTime);
      } else if (mode === "pomodoro" && pomodoroPhase === "focus") {
        const timeSpent = prevRemainingTime - remainingTime;
        if (timeSpent > 0) {
          setTotalFocusTime((prev) => prev + timeSpent);
          updateStreak();
        }
        setPrevRemainingTime(remainingTime);
      }
    } else {
      if (mode === "stopwatch") {
        setPrevElapsedTime(elapsedTime);
      } else {
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

  // transition from Ancient to Renaissance map
  const MapComponent = totalFocusTime >= 3600000 ? RenaissanceMap : AncientMap;

  return (
    <View style={styles.container}>
      {/* Top Stats */}
      <View style={styles.statsBar}>
        <Text style={styles.statText}>🔥 Streak: {streak} day(s)</Text>
        <Text style={styles.statText}>
          ⏳ Total: {Math.floor(totalFocusTime / 3600)}h{" "}
          {Math.floor((totalFocusTime % 3600) / 60)}m {totalFocusTime % 60}s /
          1000h
        </Text>
      </View>

      {/* Character Map */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/era-select",
            params: { time: totalFocusTime.toString() },
          })
        }
      >
        <View style={{ marginTop: -10, marginBottom: -120 }}>
          <MapComponent totalFocusTime={totalFocusTime} />
        </View>
      </TouchableOpacity>
      {/* Timer */}
      <Text style={styles.timer}>
        {mode === "stopwatch"
          ? formatTime(elapsedTime)
          : formatTime(remainingTime)}
      </Text>
      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, isRunning ? styles.stop : styles.start]}
          onPress={handleStartStop}
        >
          <Text style={styles.buttonText}>{isRunning ? "Stop" : "Start"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.reset]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.button, styles.mode]}
        onPress={toggleMode}
      >
        <Text style={styles.buttonText}>
          Switch to {mode === "stopwatch" ? "Pomodoro" : "Stopwatch"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
  },
  statsBar: {
    width: "90%",
    backgroundColor: "#fff8dc",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: -40,
    marginBottom: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  statText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b2e83",
    textAlign: "center",
    marginVertical: 4,
    textShadowColor: "#fff",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  timer: {
    fontSize: 64,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 20,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  start: {
    backgroundColor: "#5cb85c",
  },
  stop: {
    backgroundColor: "#d9534f",
  },
  reset: {
    backgroundColor: "#f0ad4e",
  },
  mode: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
