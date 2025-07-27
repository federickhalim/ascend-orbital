import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { formatDuration } from "@/utils/formatDuration";
// @ts-ignore
import Icon from "react-native-vector-icons/Feather";
// @ts-ignore
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { formatMarkedDates, getDailyStats } from "@/utils/analyticsUtils";

dayjs.extend(isoWeek);

export default function AnalyticsScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [monthlyLog, setMonthlyLog] = useState<string[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [avgDaily, setAvgDaily] = useState("Calculating...");
  const [longestDaily, setLongestDaily] = useState("Calculating...");
  const [totalDays, setTotalDays] = useState("Calculating...");
  const [friendRank, setFriendRank] = useState<number | null>(null);
  const [friendOutperform, setFriendOutperform] = useState<number | null>(null);
  const [friendGapText, setFriendGapText] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      if (id) setUserId(id);
    };
    loadUserId();
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userId) return;
      try {
        const userRef = doc(db, "users", userId);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          setStreak(data.streak || 0);
          setTotalFocusTime(data.totalFocusTime || 0);

          const dailyLogs: Record<string, number> = data.dailyLogs || {};
          const loggedDates = Object.keys(dailyLogs).filter(
            (date) => dailyLogs[date] > 0
          );
          setMonthlyLog(loggedDates);

          const weekStart = dayjs().startOf("isoWeek");
          const trend: number[] = [];
          for (let i = 0; i < 7; i++) {
            const day = weekStart.add(i, "day").format("YYYY-MM-DD");
            trend.push(Number(((dailyLogs[day] || 0) / 60).toFixed(1)));
          }
          setWeeklyData(trend);

          const { average, longest, numDays } = getDailyStats(dailyLogs);
          setAvgDaily(formatDuration(Math.round(average)));
          setLongestDaily(formatDuration(longest));
          setTotalDays(numDays.toString());

          const friends: string[] = data.friends || [];
          const usersToInclude = [...friends, userId];
          const friendDocs = await Promise.all(
            usersToInclude.map((uid) => getDoc(doc(db, "users", uid)))
          );

          const leaderboard = friendDocs
            .filter((docSnap) => docSnap.exists())
            .map((docSnap) => ({
              id: docSnap.id,
              username: docSnap.data().username || "Unknown",
              totalFocusTime: docSnap.data().totalFocusTime || 0,
            }))
            .sort((a, b) => b.totalFocusTime - a.totalFocusTime);

          const myRank = leaderboard.findIndex((u) => u.id === userId);
          setFriendRank(myRank + 1);

          const outperform =
            myRank === 0
              ? 100
              : Math.round(
                  ((leaderboard.length - myRank - 1) /
                    (leaderboard.length - 1)) *
                    100
                );
          setFriendOutperform(outperform);

          if (myRank > 0) {
            const above = leaderboard[myRank - 1];
            const gap = above.totalFocusTime - (data.totalFocusTime || 0);
            setFriendGapText(
              `Catch ${above.username} by clocking ${formatDuration(gap)} more`
            );
          } else {
            setFriendGapText("You're leading the board!");
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, [userId]);

  const markedDates = formatMarkedDates(monthlyLog || []);

  return (
    <ImageBackground
      source={require("@/assets/images/settings-profile-bg.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Focus Analytics Dashboard</Text>

        <View style={styles.card}>
          <View style={styles.rowIconText}>
            <MaterialCommunityIcons
              name="fire"
              size={20}
              color="#007bff"
              style={styles.iconSpacing}
            />
            <Text style={styles.bigText}>Streak: {streak} day(s)</Text>
          </View>
          <View style={styles.rowIconText}>
            <MaterialCommunityIcons
              name="timer-sand"
              size={20}
              color="#007bff"
              style={styles.iconSpacing}
            />
            <Text style={styles.bigText}>
              Total: {formatDuration(totalFocusTime)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Monthly Calendar</Text>
            <View style={styles.roundedCard}>
              <Calendar
                markedDates={markedDates}
                theme={{ dotColor: "orange", todayTextColor: "#007bff" }}
              />
            </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Weekly Focus Trend</Text>
            <View style={styles.roundedCard}>
              <BarChart
                data={{
                  labels: ["M", "T", "W", "T", "F", "S", "S", ""],
                  datasets: [{ data: [...weeklyData, 0] }],
                }}
                width={Dimensions.get("window").width - 7}
                height={220}
                yAxisLabel=""
                yAxisSuffix="m"
                fromZero
                segments={5}
                showValuesOnTopOfBars
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                  labelColor: () => "#333",
                  propsForLabels: { fontSize: 10 },
                }}
                style={{ marginVertical: 8 }}
              />
            </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Daily Insights</Text>
          <View style={styles.row}>
            <View style={styles.cardItemHalf}>
              <Icon name="bar-chart" size={20} color="#007bff" />
              <Text style={styles.cardText}>Average Daily Focus</Text>
              <Text style={styles.cardValue}>{avgDaily}</Text>
            </View>
            <View style={styles.cardItemHalf}>
              <Icon name="clock" size={20} color="#007bff" />
              <Text style={styles.cardText}>Longest Daily Focus</Text>
              <Text style={styles.cardValue}>{longestDaily}</Text>
            </View>
          </View>
          <View style={styles.cardItemFull}>
            <Icon name="calendar" size={20} color="#007bff" />
            <Text style={styles.cardText}>Total Focus Days</Text>
            <Text style={styles.cardValue}>{totalDays}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Friends Insights</Text>
          <View style={styles.row}>
            {friendRank !== null && (
              <View style={styles.cardItemHalf}>
                <Icon name="award" size={20} color="#007bff" />
                <Text style={styles.cardText}>Rank</Text>
                <Text style={styles.cardValue}>#{friendRank}</Text>
              </View>
            )}
            {friendOutperform !== null && (
              <View style={styles.cardItemHalf}>
                <Icon name="trending-up" size={20} color="#007bff" />
                <Text style={styles.cardText}>Outperform % of Friends</Text>
                <Text style={styles.cardValue}>{friendOutperform}%</Text>
              </View>
            )}
          </View>
          {friendGapText && (
            <View style={styles.cardItemFull}>
              <Icon name="target" size={20} color="#007bff" />
              <Text style={styles.cardText}>Catch-up</Text>
              <Text style={styles.cardValue}>{friendGapText}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "transparent",
  },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: {
    backgroundColor: "#e6f0ff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  bigText: { fontSize: 16, fontWeight: "bold" },
  section: { marginBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  cardItemHalf: {
    flex: 1,
    backgroundColor: "#e6f0ff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 100,
  },
  cardItemFull: {
    backgroundColor: "#e6f0ff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
    alignSelf: "stretch",
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
    textAlign: "center",
    alignSelf: "stretch",
  },
  rowIconText: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  iconSpacing: {
    marginRight: 6,
  },
  roundedCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginVertical: 4,
  },
});
