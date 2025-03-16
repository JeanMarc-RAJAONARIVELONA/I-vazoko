import { useLocalSearchParams } from "expo-router";
import PlaylistView from "../../component/PlaylistView";
import { View } from "react-native";

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1 }}>
      <PlaylistView playlistId={id as string} />
    </View>
  );
}
