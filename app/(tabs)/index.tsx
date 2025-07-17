import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  DimensionValue,
  Alert,
} from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import dayjs from "dayjs";
import { useRouter, useFocusEffect } from "expo-router";
import AncientMap from "@/components/AncientMap";
import RenaissanceMap from "@/components/RenaissanceMap";
import FutureMap from "@/components/FutureMap";
import EraTransitionWrapper from "@/components/EraTransitionWrapper";
import { getProgressToNextStage } from "@/utils/getProgressToNextStage";
import { RENAISSANCE_START, FUTURE_START } from "@/config/eraThresholdConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { formatDuration } from "@/utils/formatDuration";
import { Audio } from "expo-av";
import SessionCompleteModal from "@/components/SessionCompleteModal";

const router = useRouter();

type ModeType = "stopwatch" | "pomodoro";
type PomodoroPhase = "focus" | "break";

export default function HomeScreen() {
  const POMODORO_DURATION = 5; // test value
  const BREAK_DURATION = 3;     // test value

  const [mode, setMode] = useState<ModeType>("stopwatch");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("focus");
  const [remainingTime, setRemainingTime] = useState(POMODORO_DURATION);

  const [streak, setStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState("");
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [dailyLogs, setDailyLogs] = useState<Record<string, number>>({});

  const [hasLoadedFromFirestore, setHasLoadedFromFirestore] = useState(false);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [isBreakModal, setIsBreakModal] = useState(false);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const wasRunningBeforeResetRef = useRef(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playAlarm = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/ringtone/timer.mp3")
      );
      setSound(sound);
      await sound.playAsync();
    } catch (err) {
      console.error("Alarm error:", err);
    }
  };

  useEffect(() => {
    if (!sound) return;
    return () => {
      sound.unloadAsync();
    };
  }, [sound]);

  useEffect(() => {
    const checkAuth = async () => {
      const id = await AsyncStorage.getItem("userId");
      if (!id) {
        router.replace("/(auth)/login");
      } else {
        setUserId(id);
      }
      setCheckingAuth(false);
    };
    checkAuth();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        if (!userId) return;
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUsername(data.username || "User");
          }
        } catch (err) {
          console.error("Fetch user error:", err);
        }
      };
      fetchUserData();
    }, [userId])
  );

  useEffect(() => {
    if (!userId) return;
    const fetchFocusTime = async () => {
      try {
        const snapshot = await getDoc(doc(db, "users", userId));
        if (snapshot.exists()) {
          const data = snapshot.data();
          setTotalFocusTime(data.totalFocusTime || 0);
          setStreak(data.streak || 0);
          setLastStudyDate(data.lastStudyDate || "");
          setDailyLogs(data.dailyLogs || {});

          // Reset streak if needed
          const today = dayjs().format("YYYY-MM-DD");
          const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
          if (data.lastStudyDate && ![today, yesterday].includes(data.lastStudyDate)) {
            setStreak(0);
          }
        }
        setHasLoadedFromFirestore(true);
      } catch (err) {
        console.error("Fetch focus time error:", err);
      }
    };
    fetchFocusTime();
  }, [userId]);

  useEffect(() => {
    if (!hasLoadedFromFirestore) return;
    const saveFocusTime = async () => {
      if (!userId) return;
      try {
        await setDoc(
          doc(db, "users", userId),
          { totalFocusTime, streak, lastStudyDate, dailyLogs },
          { merge: true }
        );
      } catch (err) {
        console.error("Save focus time error:", err);
      }
    };
    saveFocusTime();
  }, [totalFocusTime, streak, lastStudyDate, dailyLogs, hasLoadedFromFirestore]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => {
        if (mode === "stopwatch") {
          setElapsedTime((prev) => prev + 1);
          setSessionTime((prev) => prev + 1);
        } else {
          setRemainingTime((prev) => (prev <= 1 ? 0 : prev - 1));
          if (pomodoroPhase === "focus") {
            setSessionTime((prev) => prev + 1);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode, pomodoroPhase]);

  useEffect(() => {
    if (!isRunning || mode !== "pomodoro") return;

    if (remainingTime === 0) {
      playAlarm();
      setIsBreakModal(pomodoroPhase === "break");
      setShowSessionComplete(true);

      if (pomodoroPhase === "focus" && sessionTime > 0) {
        completeSession(sessionTime);
      }

      setIsRunning(false);
      setSessionTime(0);
    }
  }, [remainingTime, isRunning, mode, pomodoroPhase]);

  const completeSession = (time: number) => {
    const today = dayjs().format("YYYY-MM-DD");

    setTotalFocusTime((prev) => prev + time);
    setDailyLogs((prev) => ({
      ...prev,
      [today]: (prev[today] || 0) + time,
    }));

    updateStreak();
    setLastStudyDate(today);
  };

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

  const actuallyReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setSessionTime(0);
    setPomodoroPhase("focus");
    if (mode === "pomodoro") {
      setRemainingTime(POMODORO_DURATION);
    }
  };

  const handleReset = () => {
    if (sessionTime > 0) {
      wasRunningBeforeResetRef.current = isRunning;
      setIsRunning(false);

      Alert.alert(
        "Confirm Reset",
        "Are you sure you want to reset? You will lose all progress clocked in this session.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setIsRunning(wasRunningBeforeResetRef.current);
            },
          },
          {
            text: "Reset",
            style: "destructive",
            onPress: actuallyReset,
          },
        ]
      );
    } else {
      actuallyReset();
    }
  };

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false);
      if (sessionTime > 0) {
        completeSession(sessionTime);
      }
      setSessionTime(0);
    } else {
      setIsRunning(true);
    }
  };

  const toggleMode = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setSessionTime(0);
    setPomodoroPhase("focus");
    setRemainingTime(POMODORO_DURATION);
    setMode((prev) => (prev === "stopwatch" ? "pomodoro" : "stopwatch"));
  };

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

  const liveFocusTime =
    mode === "pomodoro" && pomodoroPhase === "break"
      ? totalFocusTime
      : totalFocusTime + sessionTime;

  const { current, max, label } = getProgressToNextStage(liveFocusTime);
  const progressPercent = Math.min(current / max, 1);

  const currentEra =
    liveFocusTime >= FUTURE_START
      ? "future"
      : liveFocusTime >= RENAISSANCE_START
      ? "renaissance"
      : "ancient";

  const MapComponent =
    currentEra === "future"
      ? FutureMap
      : currentEra === "renaissance"
      ? RenaissanceMap
      : AncientMap;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (checkingAuth) return null;

  return (
    <View style={styles.container}>
      <View style={styles.statsBar}>
        {username && <Text style={styles.greet}>Hi, {username}!</Text>}
        <Text style={styles.statText}>🔥 Streak: {streak} day(s)</Text>
        <Text style={styles.statText}>
          ⏳ Total: {formatDuration(liveFocusTime)}
        </Text>
        <View style={styles.progressWrapper}>
          <Text style={styles.progressLabel}>{label}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent * 100}%` as DimensionValue },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {formatDuration(current)} / {formatDuration(max, true)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/era-select",
            params: { time: liveFocusTime.toString() },
          })
        }
      >
        <View style={styles.mapWrapper}>
          <EraTransitionWrapper currentEra={currentEra}>
            <MapComponent totalFocusTime={liveFocusTime} />
          </EraTransitionWrapper>
        </View>
      </TouchableOpacity>

      <Text style={styles.eraNameText}>
        {currentEra === "ancient"
          ? "🏺 Ancient Egypt"
          : currentEra === "renaissance"
          ? "🎭 Renaissance"
          : "🛸 Future"}
      </Text>

      <Text style={styles.timer}>
        {mode === "stopwatch"
          ? formatTime(elapsedTime)
          : formatTime(remainingTime)}
      </Text>

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

      <TouchableOpacity style={[styles.button, styles.mode]} onPress={toggleMode}>
        <Text style={styles.buttonText}>
          Switch to {mode === "stopwatch" ? "Pomodoro" : "Stopwatch"}
        </Text>
      </TouchableOpacity>

      {showSessionComplete && (
        <SessionCompleteModal
          isBreak={isBreakModal}
          onOptionSelect={(option) => {
            sound?.stopAsync();
            setShowSessionComplete(false);
            setIsBreakModal(false);

            if (option === "break") {
              setPomodoroPhase("break");
              setRemainingTime(BREAK_DURATION);
              setIsRunning(true);
            } else if (option === "continue") {
              setPomodoroPhase("focus");
              setRemainingTime(POMODORO_DURATION);
              setIsRunning(true);
            } else {
              setPomodoroPhase("focus");
              setRemainingTime(POMODORO_DURATION);
              setSessionTime(0);
              setIsRunning(false);
            }
          }}
        />
      )}
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
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  greet: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b2e83",
    marginBottom: 8,
  },
  statText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4b2e83",
    textAlign: "center",
    marginVertical: 4,
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
  progressWrapper: {
    width: "100%",
    marginTop: 12,
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: "#4b2e83",
    fontWeight: "500",
  },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 10,
  },
  progressText: {
    fontSize: 13,
    marginTop: 2,
    color: "#4b2e83",
    fontWeight: "500",
  },
  eraNameText: {
    fontSize: 25,
    fontWeight: "700",
    color: "#333",
  },
  mapWrapper: {
    marginTop: -50,
    marginBottom: 10,
    alignItems: "center",
  },
});
