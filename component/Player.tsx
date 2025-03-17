import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Slider from "@react-native-community/slider";
import { useEffect } from "react";
import { Track, useAudioStore } from "@/store/audioStore";
import { useTheme } from "@/context/ThemeContext";
import { 
  State, 
  useProgress, 
  usePlaybackState,
  RepeatMode,
} from "react-native-track-player";

const { width, height } = Dimensions.get("window");

interface PlayerProps {}

export default function Player({}: PlayerProps) {
  const params = useLocalSearchParams();
  const track: Track | null = params.track
    ? JSON.parse(params.track as string)
    : null;
  const { theme } = useTheme();
  const playbackState = usePlaybackState();
  const progress = useProgress();

  const {
    currentTrack,
    repeatMode,
    isShuffled,
    loadTrack,
    togglePlayback,
    nextTrack,
    previousTrack,
    seekTo,
    toggleShuffle,
    toggleRepeat,
  } = useAudioStore();

  const isPlaying = playbackState?.state === State.Playing;

  useEffect(() => {
    if (!currentTrack || currentTrack.id !== track?.id) {
      track && loadTrack(track);
    }
  }, [track, currentTrack, loadTrack]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const AudioVisualizer: React.FC = () => (
    <View style={styles.visualizerContainer}>
      {Array(20)
        .fill(0)
        .map((_, index) => (
          <View
            key={index}
            style={[styles.visualizerBar, { height: Math.random() * 20 + 10 }]}
          />
        ))}
    </View>
  );

  const getRepeatIcon = (mode: RepeatMode) => {
    switch (mode) {
      case RepeatMode.Track:
        return "repeat";
      case RepeatMode.Queue:
        return "repeat";
      default:
        return "repeat-outline";
    }
  };

  const isRepeatActive = (mode: RepeatMode) => {
    return mode !== RepeatMode.Off;
  };

  if (!track) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>
          Erreur : Aucune piste sélectionnée
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.headerButton,
            { backgroundColor: theme.tertyBg || theme.background },
          ]}
        >
          <Ionicons name="chevron-down" color={theme.icon} size={28} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          En lecture
        </Text>
        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: theme.tertyBg || theme.background },
          ]}
        >
          <Ionicons name="share-outline" color={theme.icon} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.albumContainer}>
          <Image
            source={track.artwork}
            style={styles.artwork}
            contentFit="cover"
            transition={1000}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {track.title}
          </Text>
          <Text style={[styles.artist, { color: theme.icon }]}>
            {track.artist}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <AudioVisualizer />
          <Slider
            value={progress.position}
            onSlidingComplete={(value) => seekTo(value)}
            style={styles.progressBar}
            minimumValue={0}
            maximumValue={progress.duration || 1}
            minimumTrackTintColor={theme.tint}
            maximumTrackTintColor={theme.tabIconDefault}
            thumbTintColor={theme.tint}
          />
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: theme.icon }]}>
              {formatTime(progress.position * 1000)}
            </Text>
            <Text style={[styles.timeText, { color: theme.icon }]}>
              {formatTime(progress.duration * 1000)}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={toggleShuffle}
            style={[
              styles.secondaryButton,
              { backgroundColor: theme.tertyBg || theme.background },
            ]}
          >
            <Ionicons
              name={isShuffled ? "shuffle" : "shuffle-outline"}
              color={isShuffled ? theme.tint : theme.icon}
              size={22}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={previousTrack}
            style={[
              styles.mainButton,
              { backgroundColor: "rgba(140,92,246,0.2)" },
            ]}
          >
            <Ionicons name="play-skip-back" color={theme.text} size={28} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayback}
            style={[styles.playButton, { backgroundColor: theme.tint }]}
          >
            {isPlaying ? (
              <Ionicons name="pause" color={theme.text} size={32} />
            ) : (
              <Ionicons name="play" color={theme.text} size={32} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={nextTrack}
            style={[
              styles.mainButton,
              { backgroundColor: "rgba(140,92,246,0.2)" },
            ]}
          >
            <Ionicons name="play-skip-forward" color={theme.text} size={28} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleRepeat}
            style={[
              styles.secondaryButton,
              { backgroundColor: theme.tertyBg || theme.background },
            ]}
          >
            <Ionicons
              name={getRepeatIcon(repeatMode)}
              color={isRepeatActive(repeatMode) ? theme.tint : theme.icon}
              size={22}
            />
            {repeatMode === RepeatMode.Track && (
              <Text style={[styles.repeatOne, { color: theme.tint }]}>1</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  albumContainer: {
    width: width - 50,
    height: height / 2.7,
    marginVertical: 30,
    borderRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  artwork: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  infoContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  artist: {
    fontSize: 16,
    opacity: 0.8,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 30,
  },
  visualizerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 30,
    marginBottom: 10,
    gap: 2,
  },
  visualizerBar: {
    width: 3,
    backgroundColor: "transparent",
    borderRadius: 2,
    opacity: 0.7,
  },
  progressBar: {
    width: "100%",
    height: 40,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -10,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  secondaryButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  mainButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(140,92,246,0.2)",
  },
  playButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  repeatOne: {
    position: "absolute",
    fontSize: 10,
    fontWeight: "bold" as const,
    top: "50%",
    left: "50%",
    transform: [{ translateX: -4 }, { translateY: -4 }],
  },
});
