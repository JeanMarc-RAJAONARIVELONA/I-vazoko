import CreatePlaylist from "@/component/CreatePlaylist";
import { Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

export default function CreatePlaylistScreen() {
  const { mode, playlistId } = useLocalSearchParams();
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: mode === "add" ? "Ajouter des titres" : "Créer une Playlist",
          presentation: "modal",
          headerShown: true,
          animation: "slide_from_bottom",
          headerStyle: {
            backgroundColor: theme.cardBg,
          },
          headerTitleStyle: {
            color: theme.text,
          },
        }}
      />
      <CreatePlaylist
        mode={mode as "create" | "add"}
        playlistId={playlistId as string}
      />
    </>
  );
};


