import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import useUserStats from "../../hooks/useUserStats";
import useFriendRank from "../../hooks/useFriendRank";

export default function EraScreen() {
  const router = useRouter();
  const userId = "demo-user";
  const { focusTime, streak } = useUserStats(userId);
  const { rank, total } = useFriendRank(userId);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.stat}>⏳ {formatTime(focusTime)} / 1000 hrs</Text>
        <Text style={styles.stat}>🔥 Streak: {streak}</Text>
      </View>

      {/* User Info */}
      <View style={styles.userBar}>
        <Text style={styles.user}>👤 Username</Text>
        <Text style={styles.rank}>
          👥 Rank: {rank ?? "-"} / {total ?? "-"}
        </Text>
      </View>

      {/* Era Map Area */}
      <View style={styles.mapArea}>
        <TouchableOpacity onPress={() => router.push("/era-select")}>
          <View style={styles.mapPlaceholder}>
            <Text style={styles.eraTitle}>🌍 Ancient Egypt</Text>
            {/* Optional: replace with image */}
            {/* <Image source={require("../../assets/egypt.jpg")} style={styles.mapImage} /> */}
            <Text style={styles.mapText}>Tap to explore all eras</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Timer Button */}
      <TouchableOpacity
        onPress={() => router.push("/timer")}
        style={styles.timerButton}
      >
        <Text style={styles.timerText}>⏱️ Start Timer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#f2f2f2",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    elevation: 2,
  },
  stat: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  userBar: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  user: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  rank: {
    fontSize: 14,
    color: "#666",
  },
  mapArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  eraTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#333",
  },
  mapPlaceholder: {
    width: "85%",
    height: 220,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#aaa",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  mapText: {
    fontSize: 16,
    color: "#888",
  },
  timerButton: {
    marginHorizontal: 40,
    marginBottom: 30,
    backgroundColor: "#ffcc00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  mapImage: {
    width: 300,
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
  },
});
