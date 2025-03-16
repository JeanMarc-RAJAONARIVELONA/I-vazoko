import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioStore, type Track } from "../store/audioStore";
import { Link, useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

// Styles statiques qui ne dépendent pas du thème
const baseStyles = StyleSheet.create({
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginVertical: 16,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    flex: 1,
    gap: 8,
  },
  playButton: {
    backgroundColor: "#007bff",
  },
  addButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#007bff",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  addButtonText: {
    color: "#007bff",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingRight: 16,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  addTracksButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 16,
  },
  addTracksText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  trackContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  trackControls: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 8,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  playIcon: {
    marginLeft: "auto",
    marginRight: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    marginLeft: 4,
  },
  playlistInfo: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  playlistArtwork: {
    width: 160,
    height: 160,
    borderRadius: 8,
    backgroundColor: "#ddd",
  },
  playlistArtworkFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  playlistArtworkLetter: {
    fontSize: 72,
    fontWeight: "600",
    color: "#007bff",
  },
  playlistDetails: {
    marginLeft: 16,
    flex: 1,
  },
  playlistName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  trackCount: {
    fontSize: 16,
  },
  controls: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  playAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 24,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  playAllText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  playbackControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  controlButton: {
    padding: 8,
  },
  playPauseButton: {
    padding: 8,
    backgroundColor: "#007bff",
    borderRadius: 24,
  },
  tracksList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  trackNumber: {
    width: 24,
    fontSize: 14,
    textAlign: "center",
  },
  trackArtwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginLeft: 12,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  activeTrackTitle: {
    color: "#007bff",
    fontWeight: "600",
  },
  trackArtist: {
    fontSize: 14,
  },
  trackDuration: {
    fontSize: 14,
    marginLeft: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    marginTop: 24,
  },
});

export default function PlaylistView({ playlistId }: { playlistId: string }) {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const {
    playlists,
    currentTrack,
    currentPlaylist,
    isPlaying,
    loadTrack,
    togglePlayback,
    setCurrentPlaylist,
    loadLocalTracks,
    loadPlaylists,
    deletePlaylist,
    removeFromPlaylist,
  } = useAudioStore();

  // Charger les pistes et playlists au montage du composant
  React.useEffect(() => {
    const initializeAudio = async () => {
      try {
        await loadLocalTracks();
        await loadPlaylists();
      } catch (error) {
        console.error("Erreur d'initialisation audio:", error);
      }
    };
    initializeAudio();
  }, []);

  // Styles dynamiques qui dépendent du thème
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
    backText: {
      ...baseStyles.backText,
      color: theme.text,
    },
    playlistName: {
      ...baseStyles.playlistName,
      color: theme.text,
    },
    playlistInfo: {
      ...baseStyles.playlistInfo,
      backgroundColor: theme.cardBg,
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
    trackDuration: {
      ...baseStyles.trackDuration,
      color: theme.textDim,
    },
    emptyText: {
      ...baseStyles.emptyText,
      color: theme.text,
    },
    buttonText: {
      ...baseStyles.buttonText,
      color: theme.text,
    },
    addButtonText: {
      ...baseStyles.addButtonText,
      color: theme.tint,
    },
    playButton: {
      ...baseStyles.playButton,
      backgroundColor: theme.tint,
    },
    addButton: {
      ...baseStyles.addButton,
      backgroundColor: theme.background,
      borderColor: theme.tint,
    },
  });

  const handleTrackPress = async (track: Track) => {
    if (currentTrack?.id === track.id) {
      await togglePlayback();
    } else {
      await loadTrack(track);
      const currentPlaylistData = playlists.find((p) => p.id === playlistId);
      if (currentPlaylistData) {
        setCurrentPlaylist(currentPlaylistData);
      }
    }
  };

  const handleDeletePlaylist = async () => {
    try {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (playlist) {
        await deletePlaylist(playlist.id);
        router.replace("/(tabs)/library");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la playlist:", error);
    }
  };

  const handleRemoveTrack = async (track: Track) => {
    try {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (playlist) {
        await removeFromPlaylist(playlist.id, track.id);
        await loadPlaylists();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du titre:", error);
    }
  };

  const playlist = playlists.find((p) => p.id === playlistId);
  if (!playlist) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Link href="/(tabs)/library" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={theme.text} />
              <Text style={styles.backText}>Retour aux playlists</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <Text style={styles.emptyText}>Playlist introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Link href="/(tabs)/library" asChild>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={theme.text} />
              <Text style={styles.backText}>Retour aux playlists</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePlaylist}
          >
            <Ionicons name="trash-outline" size={24} color={theme.tint} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.playlistInfo}>
        {playlist.artwork ? (
          <Image
            source={{ uri: playlist.artwork }}
            style={styles.playlistArtwork}
            defaultSource={require("@/assets/images/list-image.jpeg")}
          />
        ) : (
          <View
            style={[styles.playlistArtwork, styles.playlistArtworkFallback]}
          >
            <Text style={styles.playlistArtworkLetter}>
              {playlist.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.playlistDetails}>
          <Text style={styles.playlistName}>{playlist.name}</Text>
          <Text style={styles.trackCount}>
            {playlist.tracks.length} titre
            {playlist.tracks.length > 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.playButton]}
          onPress={() => {
            if (playlist.tracks.length > 0) {
              handleTrackPress(playlist.tracks[0]);
            }
          }}
        >
          <Ionicons name="play" size={24} color={theme.background} />
          <Text style={styles.buttonText}>Tout lire</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={() =>
            router.push(`/create-playlist?mode=add&playlistId=${playlist.id}`)
          }
        >
          <Ionicons name="add" size={24} color={theme.tint} />
          <Text style={[styles.buttonText, styles.addButtonText]}>
            Ajouter des song
          </Text>
        </TouchableOpacity>
      </View>

      {playlist.tracks.length > 0 ? (
        <FlatList
          data={playlist.tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const isCurrentTrack = currentTrack?.id === item.id;
            const isCurrentlyPlaying = isCurrentTrack && isPlaying;

            return (
              <TouchableOpacity
                style={styles.trackItem}
                onPress={() => handleTrackPress(item)}
              >
                <View style={styles.trackContent}>
                  <Text style={styles.trackNumber}>{index + 1}</Text>
                  <Image
                    source={require("@/assets/images/list-image.jpeg")}
                    style={styles.trackArtwork}
                  />
                  <View style={styles.trackInfo}>
                    <Text
                      style={[
                        styles.trackTitle,
                        isCurrentTrack && styles.activeTrackTitle,
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.trackArtist} numberOfLines={1}>
                      {item.artist}
                    </Text>
                  </View>
                  <View style={styles.trackControls}>
                    {isCurrentTrack && (
                      <Ionicons
                        name={
                          isCurrentlyPlaying ? "pause-circle" : "play-circle"
                        }
                        size={24}
                        color={theme.tint}
                      />
                    )}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveTrack(item)}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={24}
                        color={theme.tint}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          style={styles.tracksList}
        />
      ) : (
        <Text style={styles.emptyText}>
          Cette playlist ne contient aucun titre
        </Text>
      )}
    </View>
  );
}
