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
import EraBackgroundWrapper from "@/components/EraBackgroundWrapper";

// @ts-ignore
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

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

  if (loading || !friendData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const liveFocusTime = friendData.totalFocusTime ?? 0;

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

  return (
    <EraBackgroundWrapper focusTime={liveFocusTime}>
      <View style={styles.container}>
        <Text style={styles.title}>
          Visiting {friendData.username || "Friend"}'s Era
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons
            name="fire"
            size={20}
            color="#ff4500"
            style={{ marginRight: 3 }}
          />
          <Text style={styles.meta}>Streak: {friendData.streak ?? 0} days</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons
            name="timer-sand"
            size={20}
            color="#007bff"
            style={{ marginRight: 3 }}
          />
          <Text style={styles.meta}>
            Total Focus Time: {formatDuration(liveFocusTime)}
          </Text>
        </View>

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
    </EraBackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  meta: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    marginBottom: 0,
  },
  eraLabel: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
});
