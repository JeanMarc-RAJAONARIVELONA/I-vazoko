import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  artwork: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: PlaylistTrack[];
}

interface PlaylistStore {
  playlists: Playlist[];
  createPlaylist: (name: string, tracks: PlaylistTrack[]) => Promise<void>;
  updatePlaylist: (id: string, name: string, tracks: PlaylistTrack[]) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  loadPlaylists: () => Promise<void>;
}

export const usePlaylistStore = create<PlaylistStore>((set) => ({
  playlists: [],
  createPlaylist: async (name, tracks) => {
    try {
      const newPlaylist = { id: Date.now().toString(), name, tracks };
      // Mettre à jour l'état
      set((state) => ({
        playlists: [...state.playlists, newPlaylist],
      }));
      // Persister dans AsyncStorage
      const currentData = await AsyncStorage.getItem('playlists');
      const currentPlaylists = currentData ? JSON.parse(currentData) : [];
      await AsyncStorage.setItem('playlists', JSON.stringify([...currentPlaylists, newPlaylist]));
    } catch (error) {
      console.error('Erreur lors de la création de la playlist:', error);
      throw error;
    }
  },
  updatePlaylist: async (id, name, tracks) => {
    try {
      // Mettre à jour l'état
      set((state) => ({
        playlists: state.playlists.map((playlist) =>
          playlist.id === id ? { ...playlist, name, tracks } : playlist
        ),
      }));
      // Persister dans AsyncStorage
      const currentData = await AsyncStorage.getItem('playlists');
      const currentPlaylists = currentData ? JSON.parse(currentData) : [];
      const updatedPlaylists = currentPlaylists.map((playlist: Playlist) =>
        playlist.id === id ? { ...playlist, name, tracks } : playlist
      );
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la playlist:', error);
      throw error;
    }
  },
  deletePlaylist: async (id) => {
    try {
      // Mettre à jour l'état
      set((state) => ({
        playlists: state.playlists.filter((playlist) => playlist.id !== id),
      }));
      // Persister dans AsyncStorage
      const currentData = await AsyncStorage.getItem('playlists');
      const currentPlaylists = currentData ? JSON.parse(currentData) : [];
      const updatedPlaylists = currentPlaylists.filter((playlist: Playlist) => playlist.id !== id);
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
    } catch (error) {
      console.error('Erreur lors de la suppression de la playlist:', error);
      throw error;
    }
  },
  loadPlaylists: async () => {
    try {
      const data = await AsyncStorage.getItem('playlists');
      if (data) {
        const persistedPlaylists: Playlist[] = JSON.parse(data);
        set({ playlists: persistedPlaylists });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des playlists:', error);
      throw error;
    }
  },
}));
