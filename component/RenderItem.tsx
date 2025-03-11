import { Track } from "@/store/audioStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { FC } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export const RenderItem: FC<{
  item: any;
  loadTrack: (track: Track) => Promise<void>;
  currentTrack: Track | null;
  isPlaying: boolean;
  togglePlayback: () => Promise<void>;
}> = ({ item, loadTrack, currentTrack, isPlaying, togglePlayback }) => {
  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };
  return (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => {
        router.push({
          pathname: "/player",
          params: { track: JSON.stringify(item) },
        });
      }}
    >
      <Image
        source={require("../assets/images/list-image.jpeg")}
        style={styles.trackImage}
      />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text style={styles.trackArtist}>{item.artist}</Text>
      </View>
      <View style={styles.trackActions}>
        <Text style={styles.trackDuration}>
          {formatDuration(item.duration)}
        </Text>
        <TouchableOpacity
          onPress={() => {
            if (currentTrack?.id === item.id && isPlaying) {
              togglePlayback();
            } else {
              loadTrack(item);
            }
          }}
          style={styles.playButton}
        >
          <Ionicons
            name={currentTrack?.id === item.id && isPlaying ? "pause" : "play"}
            size={24}
            color="#6B3FA0"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  list: { flex: 1, paddingHorizontal: 10 },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: width - 20,
  },
  trackImage: { width: 50, height: 50, borderRadius: 5 },
  trackInfo: { flex: 1, marginLeft: 10 },
  trackTitle: { fontSize: 16, color: "#333" },
  trackArtist: { fontSize: 12, color: "#888" },
  trackActions: { flexDirection: "row", alignItems: "center" },
  trackDuration: { fontSize: 14, color: "#888", marginRight: 5 },
  playButton: {
    backgroundColor: "#E6D4FF",
    padding: 8,
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RenderItem;
