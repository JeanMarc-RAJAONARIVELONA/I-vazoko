import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  ImageBackground,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from "expo-av";
import { Track, useAudioStore } from "@/store/audioStore";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { RenderItem } from "@/component/RenderItem";
import AudioControlBar from "@/component/AudioControlBar";
import { useTheme } from "@/context/ThemeContext";

const { width, height } = Dimensions.get("window");

const HomeScreen: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const { theme, isDark, toggleTheme } = useTheme();

  const {
    addLocalTrack,
    localTracks,
    loadTrack,
    currentTrack,
    isPlaying,
    togglePlayback,
    nextTrack,
    previousTrack,
    clearLocalTracks,
    loadLocalTracks,
    playlists,
    addToPlaylist,
  } = useAudioStore();
  const router = useRouter();

  useEffect(() => {
    loadLocalTracks();
  }, []);

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

          const track: Track = {
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
    clearLocalTracks();
  };

  const goToPlayer = () => {
    if (currentTrack) {
      router.push({
        pathname: "/player",
        params: { track: JSON.stringify(currentTrack) },
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.tint }]}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>Bienvenue sur I-vazoko</Text>
          <Text style={styles.welcomeSubtitle}>
            Votre lecteur de musique préféré !
          </Text>
          <Text style={styles.welcomeDescription}>
            Découvrez un nouveau lecteur de musique{"\n"}
            Écoutez vos favoris à tout moment.{"\n"}
          </Text>
        </View>
        <Image
          source={require("../../assets/images/women-listen.png")}
          style={styles.welcomeImage}
          contentFit="cover"
        />
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.importContainer,
          { borderColor: theme.tint, backgroundColor: theme.buttonBg },
        ]}
        onPress={handleImportMusic}
      >
        <Ionicons name="cloud-upload-outline" size={30} color={theme.text} />
        <Text style={[styles.importSubtitle, { color: theme.text }]}>
          Select MP3 or other audio files from your device
        </Text>

        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: theme.buttonBg }]}
          onPress={clearSelection}
        >
          <Text style={[styles.clearText, { color: theme.text }]}>
            ↻ Clear Selection
          </Text>
        </TouchableOpacity>
        <Text style={[styles.supportedFormats, { color: theme.text }]}>
          Supported formats: MP3, WAV, AAC, and other browser-compatible audio
        </Text>
      </TouchableOpacity>
      <Text
        style={{
          width: "100%",
          fontSize: 16,
          color: theme.text,
          fontWeight: "bold",
          textAlign: "left",
          boxShadow: "0px 2px 4px",
          shadowColor: theme.shadowColor,
          padding: 10,
        }}
      >
        Importé récemment
      </Text>
      <FlatList
        data={localTracks}
        renderItem={({ item }: { item: Track }) => (
          <RenderItem
            item={item}
            loadTrack={loadTrack}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlayback={togglePlayback}
            onAddToPlaylist={(track) => {
              setSelectedTrack(track);
              setShowPlaylistModal(true);
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.noResults}>No audio files imported</Text>
        }
      />

      <Modal
        visible={showPlaylistModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPlaylistModal(false)}
        >
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: theme.background },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Ajouter à une playlist
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPlaylistModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              {selectedTrack && (
                <View style={styles.selectedTrack}>
                  <ImageBackground
                    source={require("../../assets/images/list-image.jpeg")}
                    style={styles.selectedTrackImage}
                    imageStyle={{ borderRadius: 8 }}
                  />
                  <View style={styles.selectedTrackInfo}>
                    <Text
                      style={[styles.selectedTrackTitle, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {selectedTrack.title}
                    </Text>
                    <Text
                      style={[
                        styles.selectedTrackArtist,
                        { color: theme.textDim },
                      ]}
                      numberOfLines={1}
                    >
                      {selectedTrack.artist}
                    </Text>
                  </View>
                </View>
              )}
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.playlistItem}
                    onPress={() => {
                      if (selectedTrack) {
                        addToPlaylist(item.id, selectedTrack);
                        setShowPlaylistModal(false);
                        setSelectedTrack(null);
                      }
                    }}
                  >
                    <View style={styles.playlistItemContent}>
                      <Text
                        style={[styles.playlistName, { color: theme.text }]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[styles.trackCount, { color: theme.textDim }]}
                      >
                        {item.tracks.length} titres
                      </Text>
                    </View>
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color={theme.textDim}
                    />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.playlistList}
                showsVerticalScrollIndicator={true}
                style={styles.playlistScrollView}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.8,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: height * 0.01,
  },
  header: {
    height: height * 0.22,
    width: width * 0.93,
    display: "flex",
    flexDirection: "row",
    top: 0,
    borderRadius: 20,
    paddingInline: width * 0.04,
    margin: 10,
    alignItems: "center",
    position: "relative",
  },
  welcomeContent: {
    flex: 1,
    zIndex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  welcomeDescription: {
    fontSize: 12,
    lineHeight: 16,
    maxWidth: width * 0.6,
    color: "#fff",
    textAlign: "left",
    marginBottom: 15,
  },
  welcomeImage: {
    width: width * 0.7,
    height: height * 0.25,
    position: "absolute",
    top: -height * 0.031,
    right: -width * 0.33,
  },
  importContainer: {
    width: width * 0.93,
    borderRadius: 10,
    padding: 10,
    margin: 10,
    alignItems: "center",
    borderWidth: 3,
    borderStyle: "dashed",
  },
  importSubtitle: {
    fontSize: 12,
    textAlign: "center",
    marginVertical: 10,
    color: "rgba(255, 255, 255, 0.7)",
  },
  browseButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    backgroundColor: "#6B3FA0",
  },
  browseText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  clearButton: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
  },
  clearText: {
    fontSize: 14,
  },
  supportedFormats: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
  list: {
    flex: 1,
  },
  noResults: { textAlign: "center", marginTop: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    borderRadius: 16,
    padding: 20,
    width: width * 0.8,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  selectedTrack: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  selectedTrackImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  selectedTrackInfo: {
    marginLeft: 16,
  },
  selectedTrackTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedTrackArtist: {
    fontSize: 14,
  },
  playlistList: {
    paddingVertical: 10,
  },
  playlistScrollView: {
    maxHeight: height * 0.4,
  },
  playlistItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  playlistItemContent: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  trackCount: {
    fontSize: 14,
  },
});

export default HomeScreen;
