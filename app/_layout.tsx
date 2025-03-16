import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { usePlaylistStore } from "@/store/playlistStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const MainLayout: React.FC = () => {
  const { isDark } = useTheme();
  const { loadPlaylists } = usePlaylistStore();

  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error("Erreur d'initialisation audio:", error);
      }
    };

    initAudio();
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <MainLayout />
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
