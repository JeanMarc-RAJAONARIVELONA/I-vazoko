import { useTheme } from "@/context/ThemeContext";
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
  onAddToPlaylist?: (track: Track) => void;
}> = ({
  item,
  loadTrack,
  currentTrack,
  isPlaying,
  togglePlayback,
  onAddToPlaylist,
}) => {
  const { theme } = useTheme();

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = ((duration % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };
  return (
    <View style={styles.trackItemContainer}>
      <TouchableOpacity
        style={[styles.trackItem, { backgroundColor: theme.background }]}
        onPress={() => {
          router.push({
            pathname: "/player",
            params: { track: JSON.stringify(item) },
          });
        }}
      >
        <Image
          source={require("../assets/images/list-image.jpeg")}
          style={[styles.trackImage, { backgroundColor: theme.background }]}
          contentFit="cover"
        />
        <View style={styles.trackInfo}>
          <Text
            style={[styles.trackTitle, { color: theme.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          <Text style={[styles.trackArtist, { color: theme.text }]}>
            {item.artist}
          </Text>
          <Text style={[styles.trackDuration, { color: theme.text }]}>
            {formatDuration(item.duration)}
          </Text>
        </View>
        <View style={styles.trackActions}>
          <TouchableOpacity
            onPress={() => {
              if (currentTrack?.id === item.id && isPlaying) {
                togglePlayback();
              } else {
                loadTrack(item);
              }
            }}
            style={[styles.playButton, { backgroundColor: theme.tint }]}
          >
            <Ionicons
              name={
                currentTrack?.id === item.id && isPlaying ? "pause" : "play"
              }
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          {onAddToPlaylist && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.addButton }]}
              onPress={() => onAddToPlaylist(item)}
            >
              <Ionicons name="add" size={20} color={theme.textDim} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
      {currentTrack?.id === item.id && (
        <View
          style={[styles.playingIndicator, { backgroundColor: theme.tint }]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  trackItemContainer: {
    position: "relative",
    marginBottom: 8,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    width: width - 32,
    marginHorizontal: 16,
  },
  trackImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    marginBottom: 2,
  },
  trackDuration: {
    fontSize: 12,
  },
  trackActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  playingIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
});

export default RenderItem;
