import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";
import { useAudioStore } from "@/store/audioStore";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RenderItem } from "@/component/RenderItem";
import AudioControl from "@/component/AudioControl";
import AudioControlBar from "@/component/AudioControlBar";

const { width, height } = Dimensions.get("window");

const HomeScreen: React.FC = () => {
  const {
    addLocalTrack,
    localTracks,
    loadTrack,
    currentTrack,
    isPlaying,
    togglePlayback,
    nextTrack,
    previousTrack,
  } = useAudioStore();
  const router = useRouter();

  const handleImportMusic = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        for (const asset of result.assets) {
          const { sound } = await Audio.Sound.createAsync(
            { uri: asset.uri },
            { shouldPlay: false }
          );

          const status = (await sound.getStatusAsync()) as AVPlaybackStatus;
          const duration =
            (status as AVPlaybackStatusSuccess).durationMillis || 0;

          const track = {
            id: asset.uri,
            title: asset.name,
            artist: "Unknown",
            artwork: require("../../assets/images/list-image.jpeg"),
            url: asset.uri,
            duration: duration,
          };

          addLocalTrack(track);
          await sound.unloadAsync();
        }
      }
    } catch (error) {
      console.error("Error importing music:", error);
    }
  };

  const clearSelection = () => {
    useAudioStore.setState({ localTracks: [] });
  };

  const goToPlayer = () => {
    if (currentTrack) {
      router.push({ pathname: "/player", params: { uri: currentTrack.url } });
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          height: height * 0.22,
          width: width * 0.93,
          display: "flex",
          flexDirection: "row",
          top: 5,
          backgroundColor: "#6B3FA0",
          borderRadius: 20,
          padding: height * 0.025,
          margin: 10,
          alignItems: "center",
          position: "relative",
        }}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
            Welcome to I-vazoko
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#fff",
              marginBottom: 10,
            }}
          >
            Your Favorite Music Player!
          </Text>
          <Text
            style={{
              fontSize: 12,
              maxWidth: width * 0.6,
              color: "#fff",
              textAlign: "left",
              marginBottom: 15,
            }}
          >
            Discover new music player {"\n"}
            Listen to your favorites anytime. {"\n"}
            by JeanMarc RAJAONARIVELONA.
          </Text>
        </View>
        <Image
          source={require("../../assets/images/women-listen.png")}
          style={{
            flex: 1,
            width: width * 0.7,
            height: height * 0.25,
            position: "absolute",
            top: -height * 0.031,
            right: -width * 0.33,
          }}
          contentFit="cover"
        />
      </View>
      <View style={styles.importContainer}>
        <Ionicons name="musical-notes-outline" size={60} color="#8c61df" />
        <Text style={styles.importSubtitle}>
          Select MP3 or other audio files from your device
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={handleImportMusic}
        >
          <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
          <Text style={styles.browseText}>Browse Files</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearSelection}>
          <Text style={styles.clearText}>↻ Clear Selection</Text>
        </TouchableOpacity>
        <Text style={styles.supportedFormats}>
          Supported formats: MP3, WAV, AAC, and other browser-compatible audio
        </Text>
      </View>

      <FlatList
        data={localTracks}
        renderItem={({ item }) => (
          <RenderItem
            item={item}
            isPlaying={isPlaying}
            currentTrack={currentTrack}
            loadTrack={loadTrack}
            togglePlayback={togglePlayback}
          />
        )}
        keyExtractor={(item: any) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.noResults}>No audio files imported</Text>
        }
      />

      {currentTrack && (
        <AudioControlBar
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          previousTrack={previousTrack}
          togglePlayback={togglePlayback}
          nextTrack={nextTrack}
          goToPlayer={goToPlayer}
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.8,
    flex: 1,
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: height * 0.03,
    gap: height * 0.01,
  },
  importContainer: {
    width: width * 0.93,
    backgroundColor: "#f0ebfb80",
    borderRadius: 10,
    padding: 10,
    margin: 10,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E6D4FF",
    borderStyle: "dashed",
  },
  importSubtitle: {
    fontSize: 14,
    color: "#6B3FA0",
    textAlign: "center",
    marginBottom: 10,
  },
  browseButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#6B3FA0",
    padding: 10,
    borderRadius: 5,
  },
  browseText: { color: "#fff", fontSize: 14 },
  clearButton: { padding: 10 },
  clearText: { color: "#6B3FA0", fontSize: 14 },
  supportedFormats: { fontSize: 12, color: "#6B3FA0", textAlign: "center" },
  list: { flex: 1, paddingHorizontal: 10 },
  noResults: { textAlign: "center", color: "#888", marginTop: 20 },
});

export default HomeScreen;
