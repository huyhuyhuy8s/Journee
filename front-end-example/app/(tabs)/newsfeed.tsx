import React from "react";
import { Button, useTheme, XStack, YStack } from "tamagui";
import { Bell, MapPinned, Search } from "@tamagui/lucide-icons";
import SafeAreaVieww from "@/components/SafeAreaVieww";

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
  const theme = useTheme();

  return (
    <SafeAreaVieww>
      <YStack bg={theme.color1} height="100%">
        <HeaderNav />
      </YStack>
    </SafeAreaVieww>
  );
};

export default Newsfeed;
