import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useAudioStore } from "@/store/audioStore";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

export default function SelectTracks() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { localTracks, addToPlaylist, loadLocalTracks, addLocalTrack } =
    useAudioStore();
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

  const handleAddTracks = async () => {
    const selectedTrackObjects = localTracks.filter((track) =>
      selectedTracks.has(track.id)
    );

    for (const track of selectedTrackObjects) {
      await addToPlaylist(id as string, track);
    }

    router.back();
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAudioFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        for (const asset of result.assets) {
          const newTrack = {
            id: Date.now().toString() + Math.random().toString(),
            title: asset.name.replace(/\.[^/.]+$/, ""), // Enlever l'extension du fichier
            artist: "Artiste inconnu",
            artwork: "",
            url: asset.uri,
            duration: 0,
          };

          try {
            await addLocalTrack(newTrack);
            // Sélectionner automatiquement le nouveau titre
            setSelectedTracks((prev) => new Set([...prev, newTrack.id]));
          } catch (err) {
            console.error("Erreur lors de l'ajout du titre:", err);
            setError(`Impossible d'ajouter le titre ${newTrack.title}`);
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sélection du fichier:", error);
      setError("Impossible de sélectionner le fichier audio");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTrackSelection = (trackId: string) => {
    const newSelection = new Set(selectedTracks);
    if (newSelection.has(trackId)) {
      newSelection.delete(trackId);
    } else {
      newSelection.add(trackId);
    }
    setSelectedTracks(newSelection);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Ajouter des titres",
          headerStyle: { backgroundColor: theme.cardBg },
          headerTintColor: theme.text,
        }}
      />

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.tint }]}
          onPress={pickAudioFile}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={[styles.buttonText, { color: theme.background }]}>
              Importation...
            </Text>
          ) : (
            <>
              <Ionicons name="add" size={24} color={theme.background} />
              <Text style={[styles.buttonText, { color: theme.background }]}>
                Importer des fichiers
              </Text>
            </>
          )}
        </TouchableOpacity>

        {error && (
          <Text style={[styles.errorText, { color: "red" }]}>{error}</Text>
        )}
      </View>

      <FlatList
        data={localTracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.trackItem,
              { backgroundColor: theme.cardBg },
              selectedTracks.has(item.id) && {
                backgroundColor: theme.tint + "20",
              },
            ]}
            onPress={() => toggleTrackSelection(item.id)}
          >
            <View style={styles.trackContent}>
              {item.artwork ? (
                <Image
                  source={{ uri: item.artwork }}
                  style={styles.trackArtwork}
                />
              ) : (
                <View
                  style={[
                    styles.trackArtwork,
                    { backgroundColor: theme.border },
                  ]}
                >
                  <Ionicons
                    name="musical-note"
                    size={24}
                    color={theme.textDim}
                  />
                </View>
              )}
              <View style={styles.trackInfo}>
                <Text
                  style={[styles.trackTitle, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={[styles.trackArtist, { color: theme.textDim }]}
                  numberOfLines={1}
                >
                  {item.artist}
                </Text>
              </View>
              {selectedTracks.has(item.id) && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={theme.tint}
                  style={styles.checkmark}
                />
              )}
            </View>
          </TouchableOpacity>
        )}
      />

      {selectedTracks.size > 0 && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.tint }]}
          onPress={handleAddTracks}
        >
          <Text style={[styles.addButtonText, { color: theme.background }]}>
            Ajouter {selectedTracks.size} titre
            {selectedTracks.size > 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },
  container: {
    flex: 1,
  },
  actionButtons: {
    padding: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  trackItem: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  trackContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  trackArtwork: {
    width: 48,
    height: 48,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  trackArtist: {
    fontSize: 14,
  },
  checkmark: {
    marginLeft: 12,
  },
  addButton: {
    margin: 16,
    padding: 16,
    borderRadius: 24,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
