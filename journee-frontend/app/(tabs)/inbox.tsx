import React from "react";
import {
  Button,
  Input,
  Separator,
  Text,
  XStack,
  YStack,
  useTheme,
  Avatar,
} from "tamagui";
import { Bell, Edit3, Search, MessageSquare } from "@tamagui/lucide-icons";
import SafeAreaVieww from "@/components/SafeAreaVieww";

// Dữ liệu mẫu (Sample Data)
const dummyMessages = [
  {
    id: 1,
    name: "Thomas Bui",
    message: "Have a good day friend.",
    time: "1 hr",
    avatarUrl: "https://picsum.photos/seed/thomas/100",
  },
];

// --- 1. Inbox Header Component ---
const InboxHeader = () => {
  const theme = useTheme();

  return (
    <XStack items="center" justify="space-between" px="$4" py="$3">
      <XStack items="center" space="$3">
        <Text fontSize="$8" fontWeight="800" color={theme.color}>
          Inbox
        </Text>
        <Bell size="$1" color={theme.color} opacity={0.8} />
      </XStack>

      <Edit3 size="$1.5" color={theme.color} />
    </XStack>
  );
};

// --- 2. Search Bar Component ---
const SearchBar = () => {
  const theme = useTheme();

  return (
    <XStack
      items="center"
      mx="$4"
      borderRadius="$6"
      px="$3"
      py="$2"
      bg={theme.static4}
    >
      <Search size="$1" color={theme.color10} />
      <Input
        flex={1}
        placeholder="Search"
        placeholderTextColor={theme.color10}
        borderWidth={0}
        bg="transparent"
        px="$2"
        fontSize="$4"
        color={theme.color}
      />
    </XStack>
  );
};

// --- 3. Message List Item Component ---
interface MessageItemProps {
  name: string;
  message: string;
  time: string;
  avatarUrl: string;
}

const MessageListItem: React.FC<MessageItemProps> = ({
  name,
  message,
  time,
  avatarUrl,
}) => {
  const theme = useTheme();

  return (
    <XStack
      items="center"
      px="$4"
      py="$3"
      space="$3"
      cursor="pointer"
      hoverStyle={{ bg: theme.backgroundHover ?? theme.static3 }}
    >
      <Avatar circular size="$6">
        <Avatar.Image src={avatarUrl} />
        <Avatar.Fallback bg={theme.accent1 ?? theme.static2} />
      </Avatar>

      <YStack flex={1}>
        <XStack items="center" justify= "space-between">
          <Text fontWeight="700" color={theme.color} fontSize="$4">
            {name}
          </Text>
        </XStack>

        <XStack items="center" space="$2" mt="$1">
          <Text color={theme.color10} fontSize="$3" opacity={0.9} numberOfLines={1} flex={1}>
            {message}
          </Text>
          <Text color={theme.color9} fontSize="$2" opacity={0.8}>
            • {time}
          </Text>
        </XStack>
      </YStack>
    </XStack>
  );
};

// --- Main Inbox Component ---
const Inbox = () => {
  const theme = useTheme();

  return (
    <SafeAreaVieww>
      <YStack flex={1} bg={theme.background} position="relative">
        <InboxHeader />
        <SearchBar />
        {/* <Separator my="$2" borderColor={theme.static3} /> */}

        <YStack flex={1} space="$1" py="$2">
          {dummyMessages.map((msg) => (
            <MessageListItem key={msg.id} {...msg} />
          ))}
        </YStack>

        <Button
          position="absolute"
          r="$5"
          b="$5"
          size="$6"
          borderRadius="$12"
          bg={theme.accent}
          icon={<MessageSquare size="$1.5" color={theme.background} />}
          shadowColor={theme.shadowColor}
          shadowOpacity={0.5}
          shadowRadius={5}
        />
      </YStack>
    </SafeAreaVieww>
  );
};

export default Inbox;