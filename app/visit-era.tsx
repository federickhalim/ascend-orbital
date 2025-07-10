import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebaseConfig";

import AncientMap from "@/components/AncientMap";
import RenaissanceMap from "@/components/RenaissanceMap";
import FutureMap from "@/components/FutureMap";
import EraTransitionWrapper from "@/components/EraTransitionWrapper";
import { RENAISSANCE_START, FUTURE_START } from "@/config/eraThresholdConfig";
import { formatDuration } from "@/utils/formatDuration";

interface User {
  username?: string;
  totalFocusTime?: number;
  streak?: number;
}

export default function VisitEraScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const [friendData, setFriendData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!friendId) {
      Alert.alert("Error", "No friend ID provided.");
      router.back();
      return;
    }

    const unsub = onSnapshot(
      doc(db, "users", friendId),
      (snapshot) => {
        if (!snapshot.exists()) {
          Alert.alert("Error", "Friend data not found.");
          router.back();
          return;
        }
        setFriendData(snapshot.data() as User);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching friend data:", error);
        Alert.alert("Error", "Something went wrong.");
        router.back();
      }
    );

    return () => unsub();
  }, [friendId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!friendData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Unable to load friend data.</Text>
      </View>
    );
  }

  const liveFocusTime = friendData.totalFocusTime || 0;

  let currentEra: "ancient" | "renaissance" | "future" = "ancient";
  if (liveFocusTime >= FUTURE_START) {
    currentEra = "future";
  } else if (liveFocusTime >= RENAISSANCE_START) {
    currentEra = "renaissance";
  }

  let MapComponent = AncientMap;
  if (currentEra === "renaissance") {
    MapComponent = RenaissanceMap;
  } else if (currentEra === "future") {
    MapComponent = FutureMap;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visiting {friendData.username || "Friend"}'s Era</Text>
      <Text style={styles.meta}>🔥 Streak: {friendData.streak ?? 0} days</Text>
      <Text style={styles.meta}>
        ⏳ Total Focus Time: {formatDuration(liveFocusTime)}
      </Text>

      <EraTransitionWrapper currentEra={currentEra}>
        <MapComponent totalFocusTime={liveFocusTime} />
      </EraTransitionWrapper>

      <Text style={styles.eraLabel}>
        {currentEra === "ancient"
          ? "🏺 Ancient Egypt"
          : currentEra === "renaissance"
          ? "🎭 Renaissance"
          : "🛸 Future"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 60, backgroundColor: "#f7f7f7" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8, color: "#333" },
  meta: { fontSize: 16, color: "#555", marginBottom: 4 },
  eraLabel: { marginTop: 12, fontSize: 18, fontWeight: "600", color: "#333" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
