import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useFocusEffect } from "expo-router";

export default function useUserStats(userId: string) {
  const [focusTime, setFocusTime] = useState(0);
  const [streak, setStreak] = useState(0);

  const fetchStats = async () => {
    try {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setFocusTime(data.totalFocusTime || 0);
        setStreak(data.streak || 0);
      }
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [userId]);

  // Re-fetch when screen is focused
  useFocusEffect(() => {
    fetchStats();
  });

  return { focusTime, streak };
}
