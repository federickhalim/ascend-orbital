import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
// @ts-ignore
import Feather from "react-native-vector-icons/Feather";
import { db } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";

interface User {
  uid: string;
  username: string;
  totalFocusTime: number;
  streak: number;
  friends?: string[];
  friendRequests?: string[];
}

export default function FriendsPage() {
  const router = useRouter();

  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [pendingExpanded, setPendingExpanded] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [expandedFriendId, setExpandedFriendId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isFirstLoad = useRef(true);
  const friendsListeners = useRef<Record<string, () => void>>({});

  useEffect(() => {
    const getUserIdAndFetch = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      if (storedId) {
        setCurrentUserId(storedId);
        setupSnapshotListeners(storedId);
      } else {
        console.warn("No userId found in AsyncStorage");
        setLoading(false);
      }
    };

    getUserIdAndFetch();

    return () => {
      // Clean up all listeners on unmount
      Object.values(friendsListeners.current).forEach((unsub) => unsub());
    };
  }, []);

  const setupSnapshotListeners = async (userId: string) => {
    const userUnsub = onSnapshot(doc(db, "users", userId), (docSnap) => {
      if (docSnap.exists()) {
        fetchFriendsData(userId, docSnap.data());
      }
    });
    friendsListeners.current["currentUser"] = userUnsub;
  };

  const fetchFriendsData = async (userId: string, userDataFromSnap?: any) => {
    if (isFirstLoad.current) {
      setLoading(true);
    }

    try {
      const userData =
        userDataFromSnap || (await getDoc(doc(db, "users", userId))).data();
      const friendIds: string[] = userData.friends || [];
      const requestIds: string[] = userData.friendRequests || [];

      setCurrentUser({
        uid: userId,
        username: userData.username || "You",
        totalFocusTime: userData.totalFocusTime || 0,
        streak: userData.streak || 0,
        friends: friendIds,
        friendRequests: requestIds,
      });

      // Clean up old friends listeners
      Object.entries(friendsListeners.current).forEach(([key, unsub]) => {
        if (key !== "currentUser") unsub();
      });
      friendsListeners.current = { currentUser: friendsListeners.current.currentUser };

      const friendsData: User[] = [];
      for (const friendId of friendIds) {
        const unsub = onSnapshot(doc(db, "users", friendId), (friendSnap) => {
          if (friendSnap.exists()) {
            const data = friendSnap.data();
            const updatedFriend: User = {
              uid: friendId,
              username: data.username,
              totalFocusTime: data.totalFocusTime || 0,
              streak: data.streak || 0,
            };

            setFriends((prev) => {
              const others = prev.filter((f) => f.uid !== friendId);
              const newFriends = [...others, updatedFriend];
              return newFriends.sort((a, b) => b.totalFocusTime - a.totalFocusTime);
            });
          }
        });
        friendsListeners.current[friendId] = unsub;

        const friendSnap = await getDoc(doc(db, "users", friendId));
        if (friendSnap.exists()) {
          const data = friendSnap.data();
          friendsData.push({
            uid: friendId,
            username: data.username,
            totalFocusTime: data.totalFocusTime || 0,
            streak: data.streak || 0,
          });
        }
      }
      setFriends(friendsData.sort((a, b) => b.totalFocusTime - a.totalFocusTime));

      // Load pending requests
      const requestsData: User[] = [];
      for (const reqId of requestIds) {
        const reqSnap = await getDoc(doc(db, "users", reqId));
        if (reqSnap.exists()) {
          const data = reqSnap.data();
          requestsData.push({
            uid: reqId,
            username: data.username,
            totalFocusTime: data.totalFocusTime || 0,
            streak: data.streak || 0,
          });
        }
      }
      setPendingRequests(requestsData);
    } catch (error) {
      console.error("❌ Error loading friends:", error);
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  };

  const addFriendByUsername = async () => {
    if (!newUsername.trim() || !currentUserId) return;
    setIsAdding(true);

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", newUsername.trim())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert("User not found", `No user with username "${newUsername}".`);
        return;
      }

      const targetDoc = snapshot.docs[0];
      const targetId = targetDoc.id;

      if (targetId === currentUserId) {
        Alert.alert("Invalid", "You cannot add yourself.");
        return;
      }

      const currentUserRef = doc(db, "users", currentUserId);
      const currentUserSnap = await getDoc(currentUserRef);
      const currentUserData = currentUserSnap.data();

      const targetRef = doc(db, "users", targetId);
      const targetSnap = await getDoc(targetRef);
      const targetData = targetSnap.data();

      const alreadyFriends = currentUserData?.friends?.includes(targetId);
      const youSentRequest = targetData?.friendRequests?.includes(currentUserId);
      const theySentRequest = currentUserData?.friendRequests?.includes(targetId);

      if (alreadyFriends) {
        Alert.alert("Already Friends", `${newUsername} is already your friend.`);
        return;
      }

      if (youSentRequest) {
        Alert.alert("Pending", `You already sent a request to ${newUsername}.`);
        return;
      }

      if (theySentRequest) {
        Alert.alert(
          "Confirm Accept",
          `${newUsername} has requested to add you! Accept now?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Accept",
              onPress: async () => {
                await updateDoc(currentUserRef, {
                  friends: arrayUnion(targetId),
                  friendRequests: arrayRemove(targetId),
                });
                await updateDoc(targetRef, {
                  friends: arrayUnion(currentUserId),
                });
                Alert.alert("Friend Added", `You are now friends with ${newUsername}!`);
                setNewUsername("");
                fetchFriendsData(currentUserId);
              },
            },
          ]
        );
        return;
      }

      Alert.alert(
        "Confirm Request",
        `Send friend request to ${newUsername}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Send Request",
            onPress: async () => {
              await updateDoc(targetRef, {
                friendRequests: arrayUnion(currentUserId),
              });
              Alert.alert("Request Sent", `Friend request sent to ${newUsername}.`);
              setNewUsername("");
            },
          },
        ]
      );
    } catch (err) {
      console.error("Error adding friend:", err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setIsAdding(false);
    }
  };

  const acceptRequest = async (requesterId: string) => {
    if (!currentUserId) return;
    try {
      await updateDoc(doc(db, "users", currentUserId), {
        friends: arrayUnion(requesterId),
        friendRequests: arrayRemove(requesterId),
      });
      await updateDoc(doc(db, "users", requesterId), {
        friends: arrayUnion(currentUserId),
      });
      Alert.alert("Success", "Friend request accepted!");
    } catch (err) {
      console.error("Error accepting request:", err);
      Alert.alert("Error", "Unable to accept request.");
    }
  };

  const rejectRequest = async (requesterId: string) => {
    if (!currentUserId) return;
    try {
      await updateDoc(doc(db, "users", currentUserId), {
        friendRequests: arrayRemove(requesterId),
      });
      Alert.alert("Request Rejected", "Friend request removed.");
    } catch (err) {
      console.error("Error rejecting request:", err);
      Alert.alert("Error", "Unable to reject request.");
    }
  };

  const confirmRemoveFriend = (friendId: string, username: string) => {
    Alert.alert("Remove Friend", `Remove ${username}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFriend(friendId),
      },
    ]);
  };

  const removeFriend = async (friendId: string) => {
    if (!currentUserId) return;
    await updateDoc(doc(db, "users", currentUserId), {
      friends: arrayRemove(friendId),
    });
    await updateDoc(doc(db, "users", friendId), {
      friends: arrayRemove(currentUserId),
    });
  };

  const leaderboardData = [...friends];
  if (currentUser) leaderboardData.push(currentUser);
  leaderboardData.sort((a, b) => b.totalFocusTime - a.totalFocusTime);

  const renderItem = ({ item, index }: { item: User; index: number }) => {
    const isMe = item.uid === currentUserId;
    return (
      <Swipeable
        renderRightActions={() =>
          !isMe ? renderRightActions(item.uid, item.username) : undefined
        }
      >
        <TouchableOpacity
          onPress={() =>
            !isMe &&
            setExpandedFriendId(
              expandedFriendId === item.uid ? null : item.uid
            )
          }
        >
          <View
            style={[
              styles.card,
              isMe && { backgroundColor: "#e6f7ff" },
            ]}
          >
            <Text style={styles.rank}>#{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{isMe ? "You" : item.username}</Text>
              <Text style={styles.meta}>
                Focus Time: {Math.floor(item.totalFocusTime / 60)} mins • Streak:{" "}
                {item.streak}
              </Text>
            </View>
          </View>
          {expandedFriendId === item.uid && (
            <View style={styles.actionRow}>
              <Button
                title="Visit Era"
                onPress={() =>
                  router.push({
                    pathname: "/visit-era",
                    params: { friendId: item.uid },
                  })
                }
              />
              <Button
                title="Remove Friend"
                color="#d9534f"
                onPress={() => confirmRemoveFriend(item.uid, item.username)}
              />
            </View>
          )}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const renderRightActions = (friendId: string, username: string) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => confirmRemoveFriend(friendId, username)}
    >
      <Text style={styles.deleteText}>Remove</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leaderboard</Text>
      <View style={styles.addFriendBox}>
        <TextInput
          placeholder="Enter friend's username"
          value={newUsername}
          onChangeText={setNewUsername}
          style={styles.input}
        />
        <Button
          title={isAdding ? "Adding..." : "Send Add Request"}
          onPress={addFriendByUsername}
          disabled={isAdding}
        />
      </View>

      {pendingRequests.length > 0 && (
        <View style={styles.pendingContainer}>
          <TouchableOpacity
            onPress={() => setPendingExpanded(!pendingExpanded)}
            style={styles.pendingHeaderRow}
          >
            <Text style={styles.pendingHeader}>
              Pending Friend Requests ({pendingRequests.length})
            </Text>
            <Feather
              name={pendingExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#333"
            />
          </TouchableOpacity>
          {pendingExpanded &&
            pendingRequests.map((req) => (
              <View key={req.uid} style={styles.pendingCard}>
                <Text style={styles.name}>{req.username}</Text>
                <View style={styles.acceptRejectRow}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => acceptRequest(req.uid)}
                  >
                    <Feather name="check" size={16} color="#28a745" />
                    <Text style={styles.acceptText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => rejectRequest(req.uid)}
                  >
                    <Feather name="x" size={16} color="#dc3545" />
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      )}

      <FlatList
        data={leaderboardData}
        renderItem={renderItem}
        keyExtractor={(item) => item.uid}
        ListEmptyComponent={<Text style={styles.empty}>No friends yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  addFriendBox: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  pendingContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  pendingCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    elevation: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  rank: { fontWeight: "bold", fontSize: 18, width: 40 },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 12, color: "#666" },
  empty: { textAlign: "center", color: "#999", marginTop: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
  pendingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingHeader: {
    fontSize: 16,
  },
  acceptRejectRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#28a745",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dc3545",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  acceptText: {
    color: "#28a745",
    marginLeft: 6,
    fontWeight: "600",
  },
  rejectText: {
    color: "#dc3545",
    marginLeft: 6,
    fontWeight: "600",
  },
});
