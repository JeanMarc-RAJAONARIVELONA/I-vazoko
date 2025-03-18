import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import TrackPlayer from 'react-native-track-player';
import { setupPlayer } from '@/services/trackPlayerServices';
import { PlaybackService } from '@/services/playbackService';
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { usePlaylistStore } from "@/store/playlistStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Register playback service
TrackPlayer.registerPlaybackService(() => PlaybackService);

const MainLayout: React.FC = () => {
  const { isDark } = useTheme();
  const { loadPlaylists } = usePlaylistStore();

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="playlist/[id]"
          options={{
            headerShown: false,
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="create-playlist"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            headerShown: true,
            gestureEnabled: true,
            gestureDirection: "vertical",
            title: "Créer une Playlist",
          }}
        />
        <Stack.Screen
          name="select-tracks/[id]"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            headerShown: true,
            gestureEnabled: true,
            gestureDirection: "vertical",
          }}
        />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaView>
  );
};

const RootLayout: React.FC = () => {
  useFrameworkReady();

  useEffect(() => {
    const initPlayer = async () => {
      try {
        await setupPlayer();
      } catch (error) {
        console.error("Error initializing track player:", error);
      }
    };

    initPlayer();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <MainLayout />
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default function Layout() {
  return <RootLayout />;
}
