import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

interface User {
  uid: string;
  totalFocusTime: number;
}

export default function useFriendRank(userId: string) {
  const [rank, setRank] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const fetchRank = async () => {
      const userRef = doc(db, "users", userId);
      const snapshot = await getDoc(userRef);
      if (!snapshot.exists()) return;

      const userData = snapshot.data();
      const currentFocus = userData.totalFocusTime || 0;
      const friendIds: string[] = userData.friends || [];

      const leaderboard: User[] = [
        { uid: userId, totalFocusTime: currentFocus },
      ];

      for (const fid of friendIds) {
        const friendSnap = await getDoc(doc(db, "users", fid));
        if (friendSnap.exists()) {
          leaderboard.push({
            uid: fid,
            totalFocusTime: friendSnap.data().totalFocusTime || 0,
          });
        }
      }

      leaderboard.sort((a, b) => b.totalFocusTime - a.totalFocusTime);
      const myRank = leaderboard.findIndex((u) => u.uid === userId) + 1;

      setRank(myRank);
      setTotal(leaderboard.length);
    };

    fetchRank();
  }, [userId]);

  return { rank, total };
}
