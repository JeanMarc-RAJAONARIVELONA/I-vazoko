import Player from "@/component/Player";
import { useLocalSearchParams } from "expo-router";

const PlayerRoute: React.FC = () => {
  const { uri } = useLocalSearchParams<{ uri: string }>();
  return <Player />;
};

export default PlayerRoute;
