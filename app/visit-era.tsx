import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

import AncientMap from "@/components/AncientMap";
import RenaissanceMap from "@/components/RenaissanceMap";
import FutureMap from "@/components/FutureMap";
import EraTransitionWrapper from "@/components/EraTransitionWrapper";
import { RENAISSANCE_START, FUTURE_START } from "@/config/eraThresholdConfig";
import { formatDuration } from "@/utils/formatDuration";

export default function VisitEraScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const [friendData, setFriendData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchFriend = async () => {
      if (!friendId) {
        Alert.alert("Error", "No friend ID provided.");
        router.back();
        return;
      }

      try {
        const docRef = doc(db, "users", friendId);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
          Alert.alert("Error", "Friend data not found.");
          router.back();
          return;
        }

        setFriendData(snapshot.data());
      } catch (err) {
        console.error("Error fetching friend data:", err);
        Alert.alert("Error", "Something went wrong.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchFriend();
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

  // ✅ Correct union type — no type error!
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
      <Text style={styles.title}>Visiting {friendData.username}'s Era</Text>
      <Text style={styles.meta}>🔥 Streak: {friendData.streak || 0} days</Text>
      <Text style={styles.meta}>⏳ Total Focus Time: {formatDuration(liveFocusTime)}</Text>

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
