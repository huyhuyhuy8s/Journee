import { Button, Text, useTheme, XStack } from "tamagui";
import { LinearGradient } from "@tamagui/linear-gradient";

const Filter = () => {
  const theme = useTheme();

  return (
    <XStack width="100%" gap="$2" paddingInline={10}>
      <Button flex={1} borderRadius={50} bg={theme.accent1}>
        <Text color={theme.color1} fontWeight="900" fontSize="$4">
          Now
        </Text>
      </Button>
      <Button flex={1} borderRadius={50}>
        <Text color={theme.color1} fontWeight="900" fontSize="$4">
          Feed
        </Text>
      </Button>
    </XStack>
  );
};

export default Filter;
