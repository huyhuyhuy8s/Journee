import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "tamagui";

const SafeAreaVieww = ({ children }: any) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor: theme.background.val }}>
      {children}
    </SafeAreaView>
  );
};

export default SafeAreaVieww;
