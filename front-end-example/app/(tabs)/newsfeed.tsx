import React from "react";
import { Button, useTheme, XStack, YStack } from "tamagui";
import { Bell, MapPinned, Search } from "@tamagui/lucide-icons";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import Filter from "@/components/newsfeed/Filter";
import StatusBar from "@/components/newsfeed/StatusBar";

const HeaderNav = () => {
  const theme = useTheme();

  return (
    <XStack paddingInline={20} paddingBlock={10} justify="space-between">
      <Bell size="$1.5" color={theme.static1} />
      <MapPinned size="$2" color={theme.accent1} />
      <Search size="$1.5" color={theme.static1} />
    </XStack>
  );
};

const Newsfeed = () => {
  const theme = useTheme();

  return (
    <SafeAreaVieww>
      <YStack bg={theme.background} height="100%">
        <HeaderNav />
        <YStack gap={10}>
          <Filter />
          <StatusBar />
        </YStack>
      </YStack>
    </SafeAreaVieww>
  );
};

export default Newsfeed;
