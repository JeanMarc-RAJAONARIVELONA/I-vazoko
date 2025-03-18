import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Playlist } from '@/store/playlistStore';
import { Track } from '@/store/audioStore';
import { useTheme } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface AddToPlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  selectedTrack: Track | null;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, track: Track) => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  visible,
  onClose,
  selectedTrack,
  playlists,
  onAddToPlaylist,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
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
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            {selectedTrack && (
              <View style={styles.selectedTrack}>
                <ImageBackground
                  source={require("../assets/images/unknown_track.png")}
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
                      onAddToPlaylist(item.id, selectedTrack);
                      onClose();
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
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  selectedTrack: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  playlistItemContent: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackCount: {
    fontSize: 14,
  },
});

export default AddToPlaylistModal;
