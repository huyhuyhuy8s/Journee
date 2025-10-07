import React from "react";
import { useTheme, XStack, YStack } from "tamagui";
import { Bell, MapPinned, Search } from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const HeaderNav = () => {
  const theme = useTheme();

  return (
    <XStack paddingInline={20} paddingBlock={10} justify="space-between">
      <Bell size="$1.5" color={theme.color7} />
      <MapPinned size="$2" color={theme.accent1} />
      <Search size="$1.5" color={theme.color7} />
    </XStack>
  );
};

const Newsfeed = () => {
  return (
    <SafeAreaView>
      <YStack>
        <HeaderNav />
      </YStack>
    </SafeAreaView>
  );
};

export default Newsfeed;
