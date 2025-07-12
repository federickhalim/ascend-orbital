import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  DimensionValue,
} from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
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
  const [mode, setMode] = useState<ModeType>("stopwatch");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [prevElapsedTime, setPrevElapsedTime] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);

  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("focus");
  const [showSessionComplete, setShowSessionComplete] = useState(false);

  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playAlarm = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/ringtone/timer.mp3")
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play sound:", error);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const [isBreakModal, setIsBreakModal] = useState(false);

  const [prevRemainingTime, setPrevRemainingTime] = useState(25 * 60);
  const [remainingTime, setRemainingTime] = useState(25 * 60);

  const [streak, setStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState("");
  const [hasLoadedFromFirestore, setHasLoadedFromFirestore] = useState(false);

  const POMODORO_DURATION = 5; // 25 * 60
  const BREAK_DURATION = 5; // 5 * 60

  const floatAnim = useRef(new Animated.Value(0)).current;
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null); // display username
  const [checkingAuth, setCheckingAuth] = useState(true); // New state for splash delay

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

  useEffect(() => {
    const fetchUserData = async () => {
      const id = await AsyncStorage.getItem("userId");
      console.log(" Retrieved userId from storage:", id); // debug
      if (!id) return;

      setUserId(id);

      try {
        const userDoc = await getDoc(doc(db, "users", id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || "User");
          console.log("Fetched username:", data.username); // debug
        }
      } catch (err) {
        console.error("Failed to fetch username:", err);
      }
    };

    fetchUserData();
  }, []);
  const [justFinishedFocus, setJustFinishedFocus] = useState(false);
  const liveFocusTime = totalFocusTime;

  const { current, max, label } = getProgressToNextStage(liveFocusTime);
  const progressPercent = Math.min(current / max, 1);

  const currentEra =
    liveFocusTime >= FUTURE_START
      ? "future"
      : liveFocusTime >= RENAISSANCE_START
      ? "renaissance"
      : "ancient";

  let MapComponent;
  if (liveFocusTime >= FUTURE_START) {
    MapComponent = FutureMap;
  } else if (liveFocusTime >= RENAISSANCE_START) {
    MapComponent = RenaissanceMap;
  } else {
    MapComponent = AncientMap;
  }

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
    if (!userId) return;

    const fetchFocusTime = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          setTotalFocusTime(data.totalFocusTime || 0);
          setStreak(data.streak || 0);
          setLastStudyDate(data.lastStudyDate || "");

          const today = dayjs().format("YYYY-MM-DD");
          const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

          if (
            data.lastStudyDate &&
            data.lastStudyDate !== today &&
            data.lastStudyDate !== yesterday
          ) {
            setStreak(0);
          }
        }

        setHasLoadedFromFirestore(true);
      } catch (error) {
        console.error("Error fetching focus time:", error);
      }
    };

    fetchFocusTime();
  }, [userId]);

  useEffect(() => {
    if (!hasLoadedFromFirestore) return;
    const saveFocusTime = async () => {
      try {
        if (!userId) return;
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
          setSessionTime((prev) => prev + 1);
        } else {
          setRemainingTime((prev) => (prev <= 1 ? 0 : prev - 1));
          setSessionTime((prev) => prev + 1);
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
      playAlarm();
      setIsBreakModal(pomodoroPhase === "break");
      setShowSessionComplete(true);

      if (pomodoroPhase === "focus") {
        setTotalFocusTime((prev) => prev + POMODORO_DURATION);
        updateStreak();
        setJustFinishedFocus(true);
      }

      setIsRunning(false);
      setSessionTime(0);
    }
  }, [remainingTime, isRunning, mode, pomodoroPhase]);

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
      setSessionTime(0);
      if (mode === "stopwatch") {
        const delta = elapsedTime - prevElapsedTime;
        if (delta > 0) {
          setTotalFocusTime((prev) => prev + delta);
          updateStreak();
        }
        setPrevElapsedTime(elapsedTime);
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
    setSessionTime(0);
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
    setSessionTime(0);
    setPomodoroPhase("focus");
    setRemainingTime(POMODORO_DURATION);
    setPrevRemainingTime(POMODORO_DURATION);
    setElapsedTime(0);
    setPrevElapsedTime(0);
    setMode((prev) => (prev === "stopwatch" ? "pomodoro" : "stopwatch"));
  };
  if (checkingAuth) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Top Stats */}
      <View style={styles.statsBar}>
        {username && (
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 8,
              color: "#4b2e83",
            }}
          >
            Hi, {username}!
          </Text>
        )}
        <Text style={styles.statText}>🔥 Streak: {streak} day(s)</Text>
        <Text style={styles.statText}>
          ⏳ Total: {formatDuration(liveFocusTime)}
        </Text>

        {/* ✅ Embedded Progress Bar */}
        <View style={styles.progressWrapper}>
          <Text style={styles.progressLabel}>{label}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(progressPercent * 100).toFixed(
                    1
                  )}%` as DimensionValue,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {formatDuration(current)} / {formatDuration(max, true)}
          </Text>
        </View>
      </View>
      {/* Character Map */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/era-select",
            params: { time: liveFocusTime.toString() },
          })
        }
      >
        <View
          style={{ marginTop: -50, marginBottom: 10, alignItems: "center" }}
        >
          <View
            style={{
              marginTop: -50,
              marginBottom: -10,
              alignItems: "center",
              height: (320 * 3) / 4,
            }}
          >
            <EraTransitionWrapper currentEra={currentEra}>
              <MapComponent totalFocusTime={liveFocusTime} />
            </EraTransitionWrapper>
          </View>
        </View>
      </TouchableOpacity>
      {/* Era Name */}
      <View style={styles.eraNameWrapper}>
        <Text style={styles.eraNameText}>
          {currentEra === "ancient"
            ? "🏺 Ancient Egypt"
            : currentEra === "renaissance"
            ? "🎭 Renaissance"
            : "🛸 Future"}
        </Text>
      </View>

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
      <TouchableOpacity
        style={[styles.button, styles.mode]}
        onPress={toggleMode}
      >
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
            setJustFinishedFocus(false);

            if (option === "break") {
              setPomodoroPhase("break");
              setRemainingTime(BREAK_DURATION);
              setIsRunning(true);
            } else if (option === "continue") {
              setPomodoroPhase("focus");
              setRemainingTime(POMODORO_DURATION);
              setIsRunning(true);
            } else {
              setIsRunning(false);
              setPomodoroPhase("focus");
              setRemainingTime(POMODORO_DURATION);
              setPrevRemainingTime(POMODORO_DURATION);
              setSessionTime(0);
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
    marginBottom: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
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
  eraNameWrapper: {
    marginTop: 15,
    marginBottom: 8,
  },
  eraNameText: {
    fontSize: 25,
    fontWeight: "700",
    color: "#333",
  },
});
