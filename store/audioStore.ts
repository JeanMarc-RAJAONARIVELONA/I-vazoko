import { create } from "zustand";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Track {
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
  isPlaying: boolean;
  currentPlaylist: Playlist | null;
  playlists: Playlist[];
  localTracks: Track[];
  likedTracks: Track[];
  recentlyPlayed: Track[];
  downloadedTracks: Track[];
  sound: Audio.Sound | null;
  progress: number;
  duration: number;
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  loadTrack: (track: Track) => Promise<void>;
  togglePlayback: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  addLocalTrack: (track: Track) => Promise<void>;
  createPlaylist: (name: string, artwork?: string) => void;
  deletePlaylist: (playlistId: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  setCurrentPlaylist: (playlist: Playlist) => void;
  toggleLike: (track: Track) => void;
  downloadTrack: (track: Track) => void;
  removeDownload: (trackId: string) => void;
  setProgress: (progress: number) => void;
  seekTo: (position: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  clearLocalTracks: () => void;
  loadLocalTracks: () => Promise<void>;
  loadTestTracks: () => Promise<void>;
  loadPlaylists: () => Promise<void>;
  loadLibraryData: () => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  // State initial

  currentTrack: null,
  isPlaying: false,
  currentPlaylist: null,
  playlists: [],
  localTracks: [],
  likedTracks: [],
  recentlyPlayed: [],
  downloadedTracks: [],
  sound: null,
  progress: 0,
  duration: 0,
  isShuffled: false,
  repeatMode: "off",

  loadTrack: async (track) => {
    const { sound: currentSound } = get();

    if (currentSound) {
      await currentSound.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: track.url },
      { shouldPlay: true, progressUpdateIntervalMillis: 1000 }
    );

    set({ currentTrack: track, sound, isPlaying: true });

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        set({
          progress: status.positionMillis || 0,
          duration: status.durationMillis || 0,
          isPlaying: status.isPlaying || false,
        });

        if (status.didJustFinish) {
          const state = get();
          if (state.repeatMode === "one") {
            sound.replayAsync();
          } else {
            state.nextTrack();
          }
        }
      }
    });
  },

  togglePlayback: async () => {
    const { sound, isPlaying } = get();

    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      set({ isPlaying: !isPlaying });
    }
  },

  nextTrack: async () => {
    const { currentPlaylist, currentTrack, isShuffled, repeatMode } = get();
    if (
      !currentTrack ||
      !currentPlaylist ||
      currentPlaylist.tracks.length === 0
    )
      return;

    if (repeatMode === "one") {
      await get().loadTrack(currentTrack);
      return;
    }

    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * currentPlaylist.tracks.length);
    } else {
      const currentIndex = currentPlaylist.tracks.findIndex(
        (track) => track.id === currentTrack.id
      );
      nextIndex = currentIndex + 1;

      if (nextIndex >= currentPlaylist.tracks.length) {
        if (repeatMode === "all") {
          nextIndex = 0;
        } else {
          return;
        }
      }
    }

    await get().loadTrack(currentPlaylist.tracks[nextIndex]);
  },

  previousTrack: async () => {
    const { currentPlaylist, currentTrack, isShuffled, repeatMode } = get();
    if (
      !currentTrack ||
      !currentPlaylist ||
      currentPlaylist.tracks.length === 0
    )
      return;

    if (repeatMode === "one") {
      await get().loadTrack(currentTrack);
      return;
    }

    let prevIndex;
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * currentPlaylist.tracks.length);
    } else {
      const currentIndex = currentPlaylist.tracks.findIndex(
        (track) => track.id === currentTrack.id
      );
      prevIndex = currentIndex - 1;

      if (prevIndex < 0) {
        if (repeatMode === "all") {
          prevIndex = currentPlaylist.tracks.length - 1;
        } else {
          return;
        }
      }
    }

    await get().loadTrack(currentPlaylist.tracks[prevIndex]);
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

  setProgress: (progress) => {
    set({ progress });
  },

  seekTo: async (position) => {
    const { sound, duration } = get();
    if (sound) {
      const validPosition = Math.max(0, Math.min(position, duration));
      await sound.setPositionAsync(validPosition);
      set({ progress: validPosition });
    }
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffled: !state.isShuffled }));
  },

  toggleRepeat: () => {
    set((state) => ({
      repeatMode:
        state.repeatMode === "off"
          ? "all"
          : state.repeatMode === "all"
          ? "one"
          : "off",
    }));
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
      } else {
        await get().loadTestTracks();
      }
    } catch (error) {
      console.error("Erreur lors du chargement des titres:", error);
      throw error;
    }
  },

  loadTestTracks: async () => {
    const testTracks: Track[] = [
      {
        id: "1",
        title: "Ny Aiko",
        artist: "Ambondrona",
        artwork: "https://picsum.photos/200/200",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        duration: 240,
      },
      {
        id: "2",
        title: "Raha Mbola Misy",
        artist: "Njakatiana",
        artwork: "https://picsum.photos/200/200",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        duration: 180,
      },
      {
        id: "3",
        title: "Tsy Maninona",
        artist: "Jaojoby",
        artwork: "https://picsum.photos/200/200",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        duration: 300,
      },
    ];

    set({ localTracks: testTracks });
    await AsyncStorage.setItem("localTracks", JSON.stringify(testTracks));

    const { playlists } = get();
    if (playlists.length === 0) {
      const testPlaylist: Playlist = {
        id: Date.now().toString(),
        name: "Playlist Gasy",
        tracks: testTracks,
        createdAt: new Date().toISOString(),
        artwork: "https://picsum.photos/200/200",
      };
      set({ playlists: [testPlaylist] });
      await AsyncStorage.setItem("playlists", JSON.stringify([testPlaylist]));
    }
  },

  toggleLike: (track) => {
    set((state) => {
      const isLiked = state.likedTracks.some((t) => t.id === track.id);
      const updatedLikedTracks = isLiked
        ? state.likedTracks.filter((t) => t.id !== track.id)
        : [...state.likedTracks, { ...track, liked: true }];
      AsyncStorage.setItem("likedTracks", JSON.stringify(updatedLikedTracks));
      return { likedTracks: updatedLikedTracks };
    });
  },

  downloadTrack: (track) => {
    set((state) => {
      const updatedDownloads = [
        ...state.downloadedTracks,
        { ...track, downloadDate: new Date().toISOString() },
      ];
      AsyncStorage.setItem(
        "downloadedTracks",
        JSON.stringify(updatedDownloads)
      );
      return { downloadedTracks: updatedDownloads };
    });
  },

  removeDownload: (trackId) => {
    set((state) => {
      const updatedDownloads = state.downloadedTracks.filter(
        (t) => t.id !== trackId
      );
      AsyncStorage.setItem(
        "downloadedTracks",
        JSON.stringify(updatedDownloads)
      );
      return { downloadedTracks: updatedDownloads };
    });
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
