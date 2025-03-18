import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ImageBackground,
  Dimensions,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { useAudioStore, Track } from "@/store/audioStore";
import { State, usePlaybackState } from "react-native-track-player";
import RenderItem from "@/component/RenderItem";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const { width, height } = Dimensions.get("window");

function MusicScreenContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const { theme } = useTheme();

  const {
    localTracks,
    playlists,
    loadLocalTracks,
    currentTrack,
    loadTrack,
    togglePlayback,
    addToPlaylist,
  } = useAudioStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use the playback state to determine if music is playing
  const playbackState = usePlaybackState();
  
  useEffect(() => {
    setIsPlaying(playbackState?.state === State.Playing);
  }, [playbackState]);

  useEffect(() => {
    loadLocalTracks();
  }, []);

  const filteredTracks = localTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.title, { color: theme.text }]}>Musique</Text>
        <View
          style={[styles.searchContainer, { backgroundColor: theme.tertyBg }]}
        >
          <Ionicons name="search" size={20} color={theme.secondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Rechercher une musique..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.secondary}
          />
        </View>
      </View>

      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RenderItem
            item={item}
            loadTrack={loadTrack}
            currentTrack={currentTrack}
            togglePlayback={togglePlayback}
            onAddToPlaylist={(track) => {
              setSelectedTrack(track);
              setShowPlaylistModal(true);
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Ajouter à une playlist</Text>
                <TouchableOpacity
                  onPress={() => setShowPlaylistModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              {selectedTrack && (
                <View style={styles.selectedTrack}>
                  <ImageBackground
                    source={require("../../assets/images/unknown_track.png")}
                    style={styles.selectedTrackImage}
                    imageStyle={{ borderRadius: 10 }}
                  />
                  <View style={styles.selectedTrackInfo}>
                    <Text style={styles.selectedTrackTitle} numberOfLines={1}>
                      {selectedTrack.title}
                    </Text>
                    <Text style={styles.selectedTrackArtist} numberOfLines={1}>
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
                      <Text style={styles.playlistName}>{item.name}</Text>
                      <Text style={styles.trackCount}>
                        {item.tracks.length} titres
                      </Text>
                    </View>
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color="rgba(255, 255, 255, 0.7)"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 400,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#fff",
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 500,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  closeButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  selectedTrack: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  selectedTrackImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  selectedTrackInfo: {
    flex: 1,
  },
  selectedTrackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 5,
  },
  selectedTrackArtist: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  playlistList: {
    paddingBottom: 20,
  },
  playlistScrollView: {
    maxHeight: height * 0.6,
  },
  playlistItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  playlistItemContent: {
    flex: 1,
    marginRight: 15,
  },
  playlistName: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  trackCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
  },
});

export default function MusicScreen() {
  return <MusicScreenContent />;
}
