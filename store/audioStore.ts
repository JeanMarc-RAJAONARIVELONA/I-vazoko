import { create } from "zustand";
import { Audio } from "expo-av";
import { Platform } from "react-native";

export interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
  duration: number;
}

interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  localTracks: Track[];
  sound: Audio.Sound | null;
  progress: number;
  duration: number;
  isShuffled: boolean;
  repeatMode: "off" | "all" | "one";
  loadTrack: (track: Track) => Promise<void>;
  togglePlayback: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  addLocalTrack: (track: Track) => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  setProgress: (progress: number) => void;
  seekTo: (position: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  playlist: [],
  localTracks: [],
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

    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: track.url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            if (status.durationMillis) {
              set({ progress: status.positionMillis / status.durationMillis });
            }

            if (status.didJustFinish) {
              const { repeatMode } = get();
              if (repeatMode === "one") {
                sound.replayAsync();
              } else if (repeatMode === "all") {
                get().nextTrack();
              }
            }
          }
        }
      );

      if (Platform.OS !== "web") {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
        });
      }

      set({
        sound,
        currentTrack: track,
        isPlaying: true,
        duration: status.isLoaded ? status.durationMillis || 0 : 0,
        playlist: get().localTracks,
      });
    } catch (error) {
      console.error("Error loading track:", error);
    }
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
    const { playlist, currentTrack, isShuffled } = get();
    if (!currentTrack || playlist.length === 0) return;

    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      const currentIndex = playlist.findIndex(
        (track) => track.id === currentTrack.id
      );
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    await get().loadTrack(playlist[nextIndex]);
  },

  previousTrack: async () => {
    const { playlist, currentTrack, isShuffled } = get();
    if (!currentTrack || playlist.length === 0) return;

    let previousIndex;
    if (isShuffled) {
      previousIndex = Math.floor(Math.random() * playlist.length);
    } else {
      const currentIndex = playlist.findIndex(
        (track) => track.id === currentTrack.id
      );
      previousIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }
    await get().loadTrack(playlist[previousIndex]);
  },

  addLocalTrack: (track) => {
    set((state) => ({
      localTracks: [...state.localTracks, track],
    }));
  },

  addToPlaylist: (track) => {
    set((state) => ({
      playlist: [...state.playlist, track],
    }));
  },

  removeFromPlaylist: (trackId) => {
    set((state) => ({
      playlist: state.playlist.filter((track) => track.id !== trackId),
    }));
  },

  setProgress: (progress) => {
    set({ progress });
  },

  seekTo: async (position) => {
    const { sound } = get();
    if (sound) {
      await sound.setPositionAsync(position * get().duration);
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
}));
