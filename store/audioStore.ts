import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TrackPlayer, {
  Track as PlayerTrack,
  RepeatMode,
  State,
  Event
} from "react-native-track-player";

export interface Track extends Omit<PlayerTrack, 'url'> {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
  duration: number;
  liked?: boolean;
  downloadDate?: string;
  lastPlayedDate?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: string;
  artwork: string;
}

interface AudioState {
  currentTrack: Track | null;
  currentPlaylist: Playlist | null;
  playlists: Playlist[];
  localTracks: Track[];
  likedTracks: Track[];
  recentlyPlayed: Track[];
  downloadedTracks: Track[];
  isShuffled: boolean;
  repeatMode: RepeatMode;
  isLoading: boolean;
  loadTrack: (track: Track, playlistTracks?: Track[]) => Promise<void>;
  setCurrentTrack: (track: Track) => void;
  togglePlayback: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  addLocalTrack: (track: Track) => Promise<void>;
  createPlaylist: (name: string, artwork?: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  setCurrentPlaylist: (playlist: Playlist) => void;
  seekTo: (position: number) => Promise<void>;
  toggleShuffle: () => Promise<void>;
  toggleRepeat: () => void;
  clearLocalTracks: () => void;
  loadLocalTracks: () => Promise<void>;
  loadPlaylists: () => Promise<void>;
  loadLibraryData: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: null,
  currentPlaylist: null,
  isLoading: false,
  playlists: [],
  localTracks: [],
  likedTracks: [],
  setCurrentTrack: (track: Track) => set({ currentTrack: track }),
  recentlyPlayed: [],
  downloadedTracks: [],
  isShuffled: false,
  repeatMode: RepeatMode.Off,

  loadTrack: async (track: Track, playlistTracks?: Track[]) => {
    try {
        await TrackPlayer.reset();
        let tracksToAdd: Track[] = [];
        
        if (playlistTracks) {
            const trackIndex = playlistTracks.findIndex(t => t.id === track.id);
            if (trackIndex !== -1) {
                tracksToAdd = [
                    ...playlistTracks.slice(trackIndex),
                    ...playlistTracks.slice(0, trackIndex)
                ];
            }
        } else {
            const { localTracks } = get();
            const trackIndex = localTracks.findIndex(t => t.id === track.id);
            if (trackIndex !== -1) {
                tracksToAdd = [
                    ...localTracks.slice(trackIndex),
                    ...localTracks.slice(0, trackIndex)
                ];
            } else {
                tracksToAdd = [track];
            }
        }

        if (tracksToAdd.length > 0) {
            await TrackPlayer.add(tracksToAdd);
            
            // Use correct Event type
            TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
                const currentTrack = await TrackPlayer.getActiveTrack();
                if (currentTrack) {
                    set({ currentTrack: currentTrack as Track });
                }
            });

            await TrackPlayer.play();
            set({ currentTrack: tracksToAdd[0] });
        }
    } catch (error) {
        console.error('Error loading track:', error);
    }
},

  togglePlayback: async () => {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  },

  nextTrack: async () => {
    const queue = await TrackPlayer.getQueue();
    if (queue.length === 0) return;

    try {
        await TrackPlayer.skipToNext();
        const track = await TrackPlayer.getActiveTrack();
        if (track) {
            set({ currentTrack: track as Track });
        }
    } catch (error) {
        console.error("Error skipping to next track:", error);
    }
},

previousTrack: async () => {
    const queue = await TrackPlayer.getQueue();
    if (queue.length === 0) return;

    try {
        await TrackPlayer.skipToPrevious();
        const track = await TrackPlayer.getActiveTrack();
        if (track) {
            set({ currentTrack: track as Track });
        }
    } catch (error) {
        console.error("Error skipping to previous track:", error);
    }
},

  seekTo: async (position) => {
    await TrackPlayer.seekTo(position);
  },

  toggleShuffle: async () => {
    const { isShuffled, currentPlaylist } = get();
    set({ isShuffled: !isShuffled });

    if (!currentPlaylist) return;

    const tracks = [...currentPlaylist.tracks];
    if (!isShuffled) {
      // Shuffle tracks
      for (let i = tracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
      }
    } else {
      // Restore original playlist order
      tracks.sort((a, b) => currentPlaylist.tracks.indexOf(a) - currentPlaylist.tracks.indexOf(b));
    }

    await TrackPlayer.reset();
    await TrackPlayer.add(tracks);

    // If there was a current track, try to maintain its position
    if (get().currentTrack) {
      const currentIndex = tracks.findIndex(t => t.id === get().currentTrack?.id);
      if (currentIndex !== -1) {
        await TrackPlayer.skip(currentIndex);
      }
    }
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const newMode = repeatMode === RepeatMode.Off
        ? RepeatMode.Queue
        : repeatMode === RepeatMode.Queue
            ? RepeatMode.Track
            : RepeatMode.Off;

    TrackPlayer.setRepeatMode(newMode);
    set({ repeatMode: newMode });
  },

  addLocalTrack: async (track) => {
    try {
      const currentData = await AsyncStorage.getItem("localTracks");
      const currentTracks = currentData ? JSON.parse(currentData) : [];
      const updatedTracks = [...currentTracks, track];

      await AsyncStorage.setItem("localTracks", JSON.stringify(updatedTracks));
      set({ localTracks: updatedTracks });

      console.log("Titre ajouté avec succès:", track.title);
    } catch (error) {
      console.error("Erreur lors de l'ajout du titre:", error);
      throw error;
    }
  },

  createPlaylist: (name, artwork) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      tracks: [],
      createdAt: new Date().toISOString(),
      artwork: artwork || require("@/assets/images/524-200x200.jpg").uri,
    };
    set((state) => {
      const updatedPlaylists = [...state.playlists, newPlaylist];
      AsyncStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
      return { playlists: updatedPlaylists };
    });
  },

  deletePlaylist: (playlistId) => {
    set((state) => {
      const updatedPlaylists = state.playlists.filter(
          (p) => p.id !== playlistId
      );
      AsyncStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
      return {
        playlists: updatedPlaylists,
        currentPlaylist:
            state.currentPlaylist?.id === playlistId
                ? null
                : state.currentPlaylist,
      };
    });
  },

  addToPlaylist: async (playlistId, track) => {
    const updatedPlaylists = get().playlists.map((playlist) => {
      if (playlist.id === playlistId) {
        const trackExists = playlist.tracks.some((t) => t.id === track.id);
        if (!trackExists) {
          return {
            ...playlist,
            tracks: [...playlist.tracks, track],
          };
        }
      }
      return playlist;
    });

    try {
      await AsyncStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
      set({ playlists: updatedPlaylists });
    } catch (error) {
      console.error("Erreur lors de l'ajout à la playlist:", error);
    }
  },

  removeFromPlaylist: (playlistId, trackId) => {
    set((state) => {
      const updatedPlaylists = state.playlists.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            tracks: playlist.tracks.filter((track) => track.id !== trackId),
          };
        }
        return playlist;
      });
      AsyncStorage.setItem("playlists", JSON.stringify(updatedPlaylists));
      return { playlists: updatedPlaylists };
    });
  },

  clearLocalTracks: () => {
    AsyncStorage.removeItem("localTracks");
    set({ localTracks: [] });
  },

  setCurrentPlaylist: (playlist) => {
    set({ currentPlaylist: playlist });
  },

  loadLocalTracks: async () => {
    try {
      const storedTracks = await AsyncStorage.getItem("localTracks");
      if (storedTracks) {
        const parsedTracks = JSON.parse(storedTracks);
        set({ localTracks: parsedTracks });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des titres:", error);
      throw error;
    }
  },

  loadPlaylists: async () => {
    const storedPlaylists = await AsyncStorage.getItem("playlists");
    if (storedPlaylists) {
      set({ playlists: JSON.parse(storedPlaylists) });
    }
  },

  loadLibraryData: async () => {
    const [playlists, likedTracks, downloadedTracks, recentlyPlayed] =
        await Promise.all([
          AsyncStorage.getItem("playlists"),
          AsyncStorage.getItem("likedTracks"),
          AsyncStorage.getItem("downloadedTracks"),
          AsyncStorage.getItem("recentlyPlayed"),
        ]);

    set({
      playlists: playlists ? JSON.parse(playlists) : [],
      likedTracks: likedTracks ? JSON.parse(likedTracks) : [],
      downloadedTracks: downloadedTracks ? JSON.parse(downloadedTracks) : [],
      recentlyPlayed: recentlyPlayed ? JSON.parse(recentlyPlayed) : [],
    });
  },
}));