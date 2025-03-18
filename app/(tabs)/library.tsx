import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAudioStore } from "@/store/audioStore";
import { usePlaylistStore } from "@/store/playlistStore";
import CreatePlaylist from "@/component/CreatePlaylist";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/context/ThemeContext";

type LibrarySection = "playlists" | "titres" | "artistes" | "albums";

function LibraryScreen() {
  const [activeSection, setActiveSection] =
    useState<LibrarySection>("playlists");
  const {
    loadLocalTracks,
    loadLibraryData,
    likedTracks,
    recentlyPlayed,
    downloadedTracks,
  } = useAudioStore();
  const { theme } = useTheme();

  const { playlists, loadPlaylists } = usePlaylistStore();

  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  useEffect(() => {
    const initializeLibrary = async () => {
      try {
        await loadLocalTracks();
        await loadPlaylists();
        await loadLibraryData();
      } catch (error) {
        console.error("Erreur d'initialisation de la bibliothèque:", error);
      }
    };

    initializeLibrary();
  }, []);

  const renderQuickAccessItem = ({
    icon,
    title,
    count,
    subtitle,
    onPress,
  }: {
    icon: any;
    title: string;
    count?: number;
    subtitle?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.quickAccessItem, { backgroundColor: theme.tertyBg }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.quickAccessIcon}>{icon}</View>
      <Text style={[styles.quickAccessTitle]}>{title}</Text>
      <Text style={styles.quickAccessSubtitle}>
        {count !== undefined ? `${count} titres` : subtitle}
      </Text>
    </TouchableOpacity>
  );

  const renderPlaylistItem = (playlist: any) => (
    <Link
      href={`/playlist/${playlist.id}`}
      asChild
      key={playlist.id}
      style={{ backgroundColor: theme.buttonBg }}
    >
      <TouchableOpacity style={styles.playlistItem} activeOpacity={0.7}>
        {playlist.artwork ? (
          <Image
            source={{ uri: playlist.artwork }}
            style={styles.playlistArtwork}
            defaultSource={require("@/assets/images/unknown_track.png")}
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
        <View style={styles.playlistInfo}>
          <Text
            style={[styles.playlistName, { color: theme.text }]}
            numberOfLines={1}
          >
            {playlist.name}
          </Text>
          <Text style={[styles.playlistCount, { color: theme.secondary }]}>
            {playlist.tracks.length}{" "}
            {playlist.tracks.length === 1 ? "titre" : "titres"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.secondary} />
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Votre Bibliothèque
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.quickAccess}>
          {renderQuickAccessItem({
            icon: <Ionicons name="heart" size={24} color={Colors.light.tint} />,
            title: "Musiques Aimées",
            count: likedTracks.length,
          })}
          {renderQuickAccessItem({
            icon: <Ionicons name="time" size={24} color={Colors.light.tint} />,
            title: "Écoutés Récemment",
            count: recentlyPlayed.length,
          })}
          {renderQuickAccessItem({
            icon: <Ionicons name="list" size={24} color={Colors.light.tint} />,
            title: "Playlists",
            count: playlists.length,
          })}
          {renderQuickAccessItem({
            icon: <Ionicons name="add" size={24} color={Colors.light.tint} />,
            title: "Créer une Playlist",
            subtitle: "Nouvelle collection",
            onPress: () => setShowCreatePlaylist(true),
          })}
        </View>

        <View style={[styles.sections, { backgroundColor: theme.background }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["Playlists", "Titres", "Artistes", "Albums"].map((section) => (
              <TouchableOpacity
                key={section}
                style={[
                  styles.sectionTab,
                  activeSection === section.toLowerCase() &&
                    styles.sectionTabActive,
                ]}
                onPress={() =>
                  setActiveSection(section.toLowerCase() as LibrarySection)
                }
              >
                <Text
                  style={[
                    styles.sectionText,
                    activeSection === section.toLowerCase() &&
                      styles.sectionTextActive,
                    { color: theme.tint },
                  ]}
                >
                  {section}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.playlistsContainer}>
          <View style={styles.playlistsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Vos Playlists
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreatePlaylist(true)}
            >
              <Ionicons name="add-circle" size={32} color={Colors.light.tint} />
            </TouchableOpacity>
          </View>
          {playlists.map(renderPlaylistItem)}
        </View>
      </ScrollView>

      <Modal
        visible={showCreatePlaylist}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreatePlaylist(false)}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Créer une Playlist</Text>
          <Pressable
            style={styles.closeButton}
            onPress={() => setShowCreatePlaylist(false)}
          >
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </Pressable>
        </View>
        <CreatePlaylist />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  playlistArtworkFallback: {
    backgroundColor: Colors.light.tertyBg,
    justifyContent: "center",
    alignItems: "center",
  },
  playlistArtworkLetter: {
    fontSize: 32,
    fontWeight: "600",
    color: Colors.light.tint,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  quickAccess: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
  },
  quickAccessItem: {
    width: "45%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  quickAccessIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  quickAccessSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  sections: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sectionTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  sectionTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tint,
  },
  sectionText: {
    fontSize: 16,
    color: Colors.light.icon,
  },
  sectionTextActive: {
    color: Colors.light.text,
    fontWeight: "600",
  },
  playlistsContainer: {
    padding: 16,
  },
  playlistsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  addButton: {
    padding: 8,
  },
  playlistItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  playlistArtwork: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  playlistCount: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.secondaryBg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
  },
  closeButton: {
    padding: 8,
  },
});

export default function Library() {
  return <LibraryScreen />;
}
