import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Image } from "expo-image";
import { usePlaylistStore } from "@/store/playlistStore";
import { Track, useAudioStore } from "@/store/audioStore";
import { useTheme } from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");

interface CreatePlaylistProps {
  mode?: "create" | "add";
  playlistId?: string;
  onClose?: () => void;
}

export default function CreatePlaylist({
  mode = "create",
  playlistId,
  onClose,
}: CreatePlaylistProps) {
  const [playlistName, setPlaylistName] = useState("");
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const { localTracks } = useAudioStore();

  const styles = StyleSheet.create({
    ...baseStyles,
    container: {
      ...baseStyles.container,
      backgroundColor: theme.background,
    },
    header: {
      ...baseStyles.header,
      backgroundColor: theme.cardBg,
    },
    headerTitle: {
      ...baseStyles.headerTitle,
      color: theme.text,
    },
    createButtonText: {
      ...baseStyles.createButtonText,
      color: theme.tint,
    },
    trackSection: {
      ...baseStyles.trackSection,
      backgroundColor: theme.background,
    },
    sectionTitle: {
      ...baseStyles.sectionTitle,
      color: theme.text,
    },
    trackItem: {
      ...baseStyles.trackItem,
      backgroundColor: theme.cardBg,
    },
    trackTitle: {
      ...baseStyles.trackTitle,
      color: theme.text,
    },
    trackArtist: {
      ...baseStyles.trackArtist,
      color: theme.textDim,
    },
    searchInput: {
      ...baseStyles.searchInput,
      backgroundColor: theme.secondaryBg,
      color: theme.text,
      borderColor: theme.border,
    },
  });

  const filteredTracks = localTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { createPlaylist, updatePlaylist, loadPlaylists, playlists } =
    usePlaylistStore();

  const currentPlaylist = playlistId
    ? playlists.find((p) => p.id === playlistId)
    : null;

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleSavePlaylist = async () => {
    try {
      setIsLoading(true);
      if (mode === "create" && playlistName.trim()) {
        // Mode création
        await createPlaylist(playlistName, selectedTracks);
        await loadPlaylists();
        // Fermer le modal
        router.push("/(tabs)/library");
      } else if (mode === "add" && playlistId) {
        // Mode ajout
        const playlist = playlists.find((p) => p.id === playlistId);
        if (playlist) {
          const newTracks = selectedTracks.filter(
            (newTrack) =>
              !playlist.tracks.some(
                (existingTrack) => existingTrack.id === newTrack.id
              )
          );
          const updatedTracks = [...playlist.tracks, ...newTracks];
          await updatePlaylist(playlistId, playlist.name, updatedTracks);
          await loadPlaylists();
          router.push("/(tabs)/library");
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la création/modification de la playlist:",
        error
      );
    } finally {
      setIsLoading(false);
      setSelectedTracks([]);
    }
  };

  const toggleTrackSelection = (track: Track) => {
    if (selectedTracks.find((t) => t.id === track.id)) {
      setSelectedTracks(selectedTracks.filter((t) => t.id !== track.id));
    } else {
      setSelectedTracks([...selectedTracks, track]);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.cardBg }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {mode === "add" ? "Ajouter des titres" : " "}
        </Text>
        <TouchableOpacity
          style={[
            styles.createButton,
            {
              opacity:
                (mode === "create"
                  ? playlistName.trim()
                  : selectedTracks.length > 0) && !isLoading
                  ? 1
                  : 0.6,
            },
          ]}
          onPress={handleSavePlaylist}
          disabled={
            (mode === "create"
              ? !playlistName.trim()
              : selectedTracks.length === 0) || isLoading
          }
        >
          {isLoading ? (
            <ActivityIndicator color={theme.tint} />
          ) : (
            <Text style={[styles.createButtonText, { color: theme.tint }]}>
              {mode === "add" ? "Ajouter" : "Créer"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {mode === "create" && (
        <View style={[styles.formSection, { backgroundColor: theme.cardBg }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.tertyBg,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                },
              ]}
              placeholder="Nom de la playlist"
              placeholderTextColor={theme.textDim}
              value={playlistName}
              onChangeText={setPlaylistName}
              autoFocus
              editable={!isLoading}
            />
          </View>
        </View>
      )}

      <View style={styles.trackSection}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.tertyBg,
              color: theme.text,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              marginBottom: 16,
            },
          ]}
          placeholder="Rechercher des titres"
          placeholderTextColor={theme.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Sélectionner des titres ({selectedTracks.length})
        </Text>
        <FlatList
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.trackItem,
                {
                  backgroundColor: selectedTracks.find((t) => t.id === item.id)
                    ? theme.tint + "20"
                    : theme.cardBg,
                  borderRadius: 12,
                  marginBottom: 8,
                  shadowColor: theme.shadowColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}
              onPress={() => toggleTrackSelection(item)}
              disabled={isLoading}
            >
              <Image
                source={require("../assets/images/unknown_track.png")}
                style={styles.trackImage}
                contentFit="cover"
              />
              <View style={styles.trackInfo}>
                <Text
                  style={[styles.trackTitle, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={[styles.trackArtist, { color: theme.textDim }]}>
                  {item.artist}
                </Text>
              </View>
              <View
                style={[
                  styles.checkbox,
                  selectedTracks.find((t) => t.id === item.id) && {
                    backgroundColor: theme.tint,
                  },
                ]}
              >
                {selectedTracks.find((t) => t.id === item.id) && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textDim }]}>
                Aucun titre disponible
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textDim }]}>
                Importez de la musique depuis l'accueil
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  createButton: {
    padding: 8,
    backgroundColor: Colors.light.tertyBg,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  formSection: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    width: "100%",
  },
  trackSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchInput: {
    width: "100%",
    height: 48,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  trackImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
