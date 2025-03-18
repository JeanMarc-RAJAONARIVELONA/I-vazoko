import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { State, usePlaybackState } from "react-native-track-player";
import { Track, useAudioStore } from "@/store/audioStore";
import { RenderItem } from "@/component/RenderItem";
import AudioControlBar from "@/component/AudioControlBar";
import { useTheme } from "@/context/ThemeContext";
import WelcomeHeader from "@/component/WelcomeHeader";
import ImportMusicButton from "@/component/ImportMusicButton";
import AddToPlaylistModal from "@/component/AddToPlaylistModal";
import {
  requestMusicLibraryPermission,
  fetchMusicAssets,
  convertAssetsToTracks,
  filterDuplicateTracks,
} from "@/utils/musicLibrary";

const { width, height } = Dimensions.get("window");

/**
 * HomeScreen component - Main screen of the application
 */
const HomeScreen: React.FC = () => {
  // State
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hooks
  const { theme } = useTheme();
  const playbackState = usePlaybackState();
  const router = useRouter();

  // Store
  const {
    addLocalTrack,
    localTracks,
    loadTrack,
    currentTrack,
    togglePlayback,
    nextTrack,
    previousTrack,
    clearLocalTracks,
    loadLocalTracks,
    playlists,
    addToPlaylist,
  } = useAudioStore();

  const isPlaying = playbackState?.state === State.Playing;

  // Load tracks on component mount
  useEffect(() => {
    loadLocalTracks();
  }, []);

  /**
   * Import music from the device's music library
   */
  const handleImportMusic = async () => {
    try {
      setIsLoading(true);

      // Request permissions
      const granted = await requestMusicLibraryPermission();
      if (!granted) {
        console.log("Permission to access media library was denied");
        return;
      }

      // Fetch music assets
      const assets = await fetchMusicAssets(80);

      if (assets.length > 0) {
        // Convert assets to tracks
        const defaultArtwork = require("../../assets/images/unknown_track.png");
        const processedTracks = convertAssetsToTracks(assets, defaultArtwork);

        // Filter out duplicates
        const newTracks = filterDuplicateTracks(processedTracks, localTracks);

        // Add tracks to library
        for (const track of newTracks) {
          await addLocalTrack(track);
        }

        console.log(`Successfully imported ${newTracks.length} new tracks`);
      } else {
        console.log("No audio files found in the media library");
      }
    } catch (error) {
      console.error("Error importing music:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear all tracks from the library
   */
  const clearSelection = () => {
    clearLocalTracks();
  };

  /**
   * Navigate to the player screen
   */
  const goToPlayer = () => {
    if (currentTrack) {
      router.push({
        pathname: "/player",
        params: { track: JSON.stringify(currentTrack) },
      });
    }
  };

  /**
   * Handle adding a track to a playlist
   */
  const handleAddToPlaylist = (track: Track) => {
    setSelectedTrack(track);
    setShowPlaylistModal(true);
  };

  /**
   * Close the playlist modal
   */
  const closePlaylistModal = () => {
    setShowPlaylistModal(false);
    setSelectedTrack(null);
  };

  /**
   * Add the selected track to a playlist
   */
  const handleAddToPlaylistConfirm = (playlistId: string, track: Track) => {
    addToPlaylist(playlistId, track);
    closePlaylistModal();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Welcome Header */}
      <WelcomeHeader />

      {/* Import Music Button */}
      <ImportMusicButton
        isLoading={isLoading}
        onImport={handleImportMusic}
        tracksCount={localTracks.length}
        onClear={clearSelection}
      />

      {/* Recent Imports Section */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Importé récemment
      </Text>

      {/* Tracks List */}
      <FlatList
        data={localTracks}
        renderItem={({ item }: { item: Track }) => (
          <RenderItem
            item={item}
            loadTrack={loadTrack}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            togglePlayback={togglePlayback}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.noResults}>No audio files imported</Text>
        }
      />

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        visible={showPlaylistModal}
        onClose={closePlaylistModal}
        selectedTrack={selectedTrack}
        playlists={playlists}
        onAddToPlaylist={handleAddToPlaylistConfirm}
      />

      {/* Audio Control Bar */}
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
    paddingBlock: 10,
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
  sectionTitle: {
    width: "100%",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    padding: 10,
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

export default function Home() {
  return <HomeScreen />;
}
