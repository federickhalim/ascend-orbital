import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

interface EraCardProps {
  name: string;
  image: any;
  unlocked: boolean;
  isCurrent?: boolean;
  onPress: () => void;
}

export default function EraCard({
  name,
  image,
  unlocked,
  isCurrent, // ✅ this was missing
  onPress,
}: EraCardProps) {
  return (
    <TouchableOpacity
      onPress={unlocked ? onPress : undefined}
      disabled={!unlocked}
    >
      <View style={[styles.card, !unlocked && styles.locked]}>
        <Image source={image} style={styles.image} resizeMode="cover" />
        <Text style={styles.name}>{name}</Text>

        {isCurrent && <Text style={styles.hereBadge}>📍 You are here</Text>}
        {!unlocked && <Text style={styles.lockText}>🔒 Locked</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    paddingBottom: 10,
  },
  image: {
    width: 300,
    height: 180,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 6,
  },
  locked: {
    opacity: 0.4,
  },
  lockText: {
    color: "#666",
    marginTop: 4,
  },
  hereBadge: {
    marginTop: 4,
    color: "#007bff",
    fontWeight: "600",
  },
});
