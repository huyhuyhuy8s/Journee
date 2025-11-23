import { Text, YStack, Avatar, useTheme, XStack } from "tamagui";

const StatusBar = () => {
  const theme = useTheme();

  return (
    <XStack paddingInline={10} paddingBlock={10} gap={10}>
      <Avatar circular size="$5">
        <Avatar.Image src="https://photos.app.goo.gl/nXQ7fA7pbreKXGi47" />
        <Avatar.Fallback bg={theme.accent1} />
      </Avatar>
      <YStack justify="center" width="100%">
        <Text fontSize="$5" fontWeight="bold" color={theme.color1}>
          User
        </Text>
        <Text fontSize="$4" color={theme.color1}>
          User name
        </Text>
      </YStack>
    </XStack>
  );
};

export default StatusBar;
