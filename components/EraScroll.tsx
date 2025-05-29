import { ScrollView } from "react-native";
import { useRef, useEffect } from "react";
import EraCard from "./EraCard";

const eras = [
  {
    key: "ancient",
    name: "Ancient Egypt",
    unlockHour: 0,
    image: require("../assets/images/egypt.jpeg"),
  },
  {
    key: "renaissance",
    name: "Renaissance",
    unlockHour: 300,
    image: require("../assets/images/renaissance.jpg"),
  },
  {
    key: "future",
    name: "Futuristic Era",
    unlockHour: 800,
    image: require("../assets/images/future.png"),
  },
];

export default function EraScroll({
  totalFocusTimeInSeconds,
}: {
  totalFocusTimeInSeconds: number;
}) {
  const totalHours = totalFocusTimeInSeconds / 3600;
  const scrollRef = useRef<ScrollView>(null);

  const currentIndex = eras.findIndex((era) => totalHours < era.unlockHour) - 1;
  const unlockedIndex = currentIndex >= 0 ? currentIndex : eras.length - 1;

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: unlockedIndex * 240, // estimated height per card
        animated: true,
      });
    }, 300);
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
    >
      {eras.map((era, index) => {
        const unlocked = totalHours >= era.unlockHour;
        const isCurrent = index === unlockedIndex;
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
