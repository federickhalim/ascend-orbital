import { ScrollView } from "react-native";
import { useRef, useEffect } from "react";
import EraCard from "./EraCard";
import {
  ANCIENT_START,
  RENAISSANCE_START,
  FUTURE_START,
} from "@/config/eraThresholdConfig";

const eras = [
  {
    key: "ancient",
    name: "Ancient Egypt",
    unlockTime: ANCIENT_START,
    image: require("../assets/images/egypt.png"),
  },
  {
    key: "renaissance",
    name: "Renaissance",
    unlockTime: RENAISSANCE_START,
    image: require("../assets/images/renaissance.png"),
  },
  {
    key: "future",
    name: "Futuristic Era",
    unlockTime: FUTURE_START,
    image: require("../assets/images/future.png"),
  },
];

export default function EraScroll({
  totalFocusTimeInSeconds,
}: {
  totalFocusTimeInSeconds: number;
}) {
  const scrollRef = useRef<ScrollView>(null);

  // Determine which era the user is currently in
  const currentEraIndex = eras.findIndex((era, i) => {
    const next = eras[i + 1];
    return next ? totalFocusTimeInSeconds < next.unlockTime : true; // Last era fallback
  });

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: currentEraIndex * 240, // Adjust if card height changes
        animated: true,
      });
    }, 300);
  }, [currentEraIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
    >
      {eras.map((era, index) => {
        const unlocked = totalFocusTimeInSeconds >= era.unlockTime;
        const isCurrent = index === currentEraIndex;
        return (
          <EraCard
            key={era.key}
            name={era.name}
            image={era.image}
            unlocked={unlocked}
            isCurrent={isCurrent}
            onPress={() => {
              console.log(`Clicked on ${era.name}`);
            }}
          />
        );
      })}
    </ScrollView>
  );
}
