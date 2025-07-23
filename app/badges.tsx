import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "@/firebaseConfig";
import { badgeConfig, Badge } from "@/constants/badgeConfig";
import { splitBadgesByUnlockStatus } from "@/utils/badgeUtils";

// 🔒 Static image map for dynamic badges
const badgeImages: Record<string, any> = {
  "ancientbadge-1": require("@/assets/images/badges/ancientbadge-1.png"),
  "ancientbadge-2": require("@/assets/images/badges/ancientbadge-2.png"),
  "renaissancebadge-1": require("@/assets/images/badges/renaissancebadge-1.png"),
  "renaissancebadge-2": require("@/assets/images/badges/renaissancebadge-2.png"),
  "futurebadge-1": require("@/assets/images/badges/futurebadge-1.png"),
  "futurebadge-2": require("@/assets/images/badges/futurebadge-2.png"),

  "totaltime10-1": require("@/assets/images/badges/totaltime10-1.png"),
  "totaltime10-2": require("@/assets/images/badges/totaltime10-2.png"),
  "totaltime100-1": require("@/assets/images/badges/totaltime100-1.png"),
  "totaltime100-2": require("@/assets/images/badges/totaltime100-2.png"),
  "totaltime1000-1": require("@/assets/images/badges/totaltime1000-1.png"),
  "totaltime1000-2": require("@/assets/images/badges/totaltime1000-2.png"),

  "streak10-1": require("@/assets/images/badges/streak10-1.png"),
  "streak10-2": require("@/assets/images/badges/streak10-2.png"),
  "streak30-1": require("@/assets/images/badges/streak30-1.png"),
  "streak30-2": require("@/assets/images/badges/streak30-2.png"),
  "streak100-1": require("@/assets/images/badges/streak100-1.png"),
  "streak100-2": require("@/assets/images/badges/streak100-2.png"),

  "totaldays10-1": require("@/assets/images/badges/totaldays10-1.png"),
  "totaldays10-2": require("@/assets/images/badges/totaldays10-2.png"),
  "totaldays100-1": require("@/assets/images/badges/totaldays100-1.png"),
  "totaldays100-2": require("@/assets/images/badges/totaldays100-2.png"),
  "totaldays1000-1": require("@/assets/images/badges/totaldays1000-1.png"),
  "totaldays1000-2": require("@/assets/images/badges/totaldays1000-2.png"),
};

export default function BadgesScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<{
    totalFocusTime: number;
    streak: number;
    totalFocusDays: number;
  } | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load userId from AsyncStorage
  useEffect(() => {
    const loadUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    };
    loadUserId();
  }, []);

  // Fetch stats + unlocked badge list
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const userRef = doc(db, "users", userId);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          const totalFocusTime = data.totalFocusTime || 0;
          const streak = data.streak || 0;
          const dailyLogs: Record<string, number> = data.dailyLogs || {};
          const totalFocusDays = Object.keys(dailyLogs).filter(
            (date) => dailyLogs[date] > 0
          ).length;

          setUserStats({ totalFocusTime, streak, totalFocusDays });
          setUnlockedBadges(data.unlockedBadges || []);
        }
      } catch (err) {
        console.error("Failed to fetch badge data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserData();
  }, [userId]);

  // Unlock new badges if conditions are met
  useEffect(() => {
    if (!userStats || !userId) return;

    const newlyUnlocked = badgeConfig
      .filter((badge) => badge.unlockCondition(userStats))
      .filter((badge) => !unlockedBadges.includes(badge.filePrefix));

    if (newlyUnlocked.length === 0) return;

    const updated = [
      ...unlockedBadges,
      ...newlyUnlocked.map((b) => b.filePrefix),
    ];

    const updateBadges = async () => {
      try {
        await setDoc(
          doc(db, "users", userId),
          { unlockedBadges: updated },
          { merge: true }
        );
        setUnlockedBadges(updated);
      } catch (err) {
        console.error("Failed to update unlocked badges:", err);
      }
    };

    updateBadges();
  }, [userStats, userId]);

  if (loading || !userStats) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const { unlocked, locked } = splitBadgesByUnlockStatus(
    badgeConfig,
    unlockedBadges
  );

  const renderBadge = (badge: Badge, isUnlocked: boolean) => {
    const key = `${badge.filePrefix}-${isUnlocked ? "1" : "2"}`;
    return (
      <TouchableOpacity
        key={badge.filePrefix}
        style={styles.badgeWrapper}
        onPress={() => {
          setSelectedBadge(badge);
          setModalVisible(true);
        }}
      >
        <Image source={badgeImages[key]} style={styles.badgeImage} />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>My Badges</Text>
      <View style={styles.grid}>
        {unlocked.length > 0 ? (
          unlocked.map((badge) => renderBadge(badge, true))
        ) : (
          <Text style={styles.emptyText}>No badges yet — start focusing!</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Not Unlocked</Text>
      <View style={styles.grid}>
        {locked.map((badge) => renderBadge(badge, false))}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedBadge?.name}</Text>
            <Text style={styles.modalDesc}>{selectedBadge?.description}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeWrapper: {
    width: 80,
    height: 80,
  },
  badgeImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  emptyText: {
    fontStyle: "italic",
    color: "#888",
    marginBottom: 12,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
    marginBottom: 16,
  },
  modalCloseButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCloseText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
