import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

interface AudioControlBarProps {
  currentTrack: any;
  isPlaying: boolean;
  togglePlayback: () => void;
  previousTrack: () => void;
  nextTrack: () => void;
  goToPlayer: () => void;
}

const AudioControlBar: React.FC<AudioControlBarProps> = ({
  currentTrack,
  isPlaying,
  togglePlayback,
  previousTrack,
  nextTrack,
  goToPlayer,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.audioControl,
        { backgroundColor: theme.buttonBg, borderTopColor: theme.buttonBg },
      ]}
    >
      <TouchableOpacity style={styles.controlInfoWrapper} onPress={goToPlayer}>
        <Image
          source={require("../assets/images/audio-wave.gif")}
          style={styles.controlImage}
        />
        <View style={styles.controlInfo}>
          <Text
            style={[styles.controlTitle, { color: theme.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {currentTrack.title}
          </Text>
          <Text style={[styles.controlArtist, { color: theme.textDim }]}>
            {currentTrack.artist}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={styles.controlActions}>
        <TouchableOpacity style={styles.controlButton} onPress={previousTrack}>
          <Ionicons name="play-skip-back" style={styles.controlButtonIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={togglePlayback}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            style={styles.controlButtonIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={nextTrack}>
          <Ionicons name="play-skip-forward" style={styles.controlButtonIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={goToPlayer}>
          <Ionicons name="resize" style={styles.controlButtonIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  audioControl: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    width: width - 20,
  },
  controlInfoWrapper: { flexDirection: "row", flex: 1, alignItems: "center" },
  controlImage: { width: 30, height: 30, borderRadius: 5 },
  controlInfo: { flex: 1, marginLeft: 10 },
  controlTitle: { fontSize: 16 },
  controlArtist: { fontSize: 12 },
  controlActions: { flexDirection: "row", alignItems: "center" },
  controlButton: {
    backgroundColor: "#E6D4FF",
    borderRadius: 15,
    padding: 5,
    marginLeft: 5,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonIcon: { color: "#6B3FA0", fontSize: 16 },
});

export default AudioControlBar;
