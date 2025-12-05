import React, { useEffect } from "react";
// 🛑 QUAN TRỌNG: Cần cài đặt và cấu hình thư viện @react-navigation/native
import { useNavigation } from "@react-navigation/native";
import {
  Button,
  Input,
  Separator,
  Text,
  XStack,
  YStack,
  useTheme,
  Avatar,
  ScrollView,
} from "tamagui";
import { Bell, Edit3, Search } from "@tamagui/lucide-icons";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import { useThemeValue } from "@/contexts/ThemeContext";

// Dữ liệu mẫu (Sample Data)
const dummyMessages = [
  {
    id: 1,
    name: "Thomas Bui",
    message: "Have a good day friend.",
    time: "1 hr",
    avatarUrl: "https://picsum.photos/seed/thomas/100",
  },
  {
    id: 2,
    name: "Finn Nguyen",
    message: "Have a good day friend.",
    time: "1 hr",
    avatarUrl: "https://picsum.photos/seed/finnguyen/100",
  },
  {
    id: 3,
    name: "Alice Dang",
    message: "Have a good day friend.",
    time: "1 min",
    avatarUrl: "https://picsum.photos/seed/alicedang/100",
  },
];

// --- 1. Inbox Header Component ---
const InboxHeader = () => {
  const theme = useTheme();

  return (
    <XStack items="center" justify="space-between" px="$4" py="$3">
      <XStack items="center" space="$3">
        <Text fontSize="$8" fontWeight="800" color={theme.color2}>
          Inbox
        </Text>
        {/* Biểu tượng Bell (chuông) giống ảnh mẫu */}
        <Bell size="$1.5" color={theme.color2} opacity={0.8} />
      </XStack>

      {/* Biểu tượng Edit (bút chì) ở góc phải */}
      <Edit3 size="$1.5" color={theme.color2} />
    </XStack>
  );
};

// --- 2. Search Bar Component ---
const SearchBar = () => {
  const theme = useTheme();

  return (
    <XStack
      items="center"
      borderRadius={10} // Giữ borderRadius nhỏ để khớp với Input
      mx="$4"
      px="$3"
      py="$1"
      // Màu nền tối hơn, giống khối Input trong ảnh mẫu
      bg={theme.static4}
    >
      <Search size="$1" color={theme.static1} />
      <Input
        flex={1}
        placeholder="Search" // Đổi placeholder thành "Search"
        placeholderTextColor={theme.static1}
        borderWidth={0}
        bg="transparent"
        px="$2"
        fontSize="$5"
        color={theme.static1}
      />
    </XStack>
  );
};

// --- 3. Message List Item Component (Đã thêm chức năng điều hướng) ---
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
  // KHAI BÁO NAVIGATION
  const navigation = useNavigation();

  // HÀM XỬ LÝ KHI NHẤN
  const handlePress = () => {
    // Thay 'ChatScreen' bằng tên screen của bạn trong Navigator
    (navigation as any).navigate("ChatScreen", {
      userName: name,
      userAvatar: avatarUrl,
    });
  };

  return (
    <XStack
      items="center"
      px="$4"
      py="$3"
      space="$3"
      cursor="pointer"
      onPress={handlePress} // GẮN SỰ KIỆN NHẤN VÀO ĐÂY
      hoverStyle={{ bg: theme.backgroundHover ?? theme.static3 }}
    >
      {/* Avatar lớn hơn một chút */}
      <Avatar circular size="$6">
        <Avatar.Image src={avatarUrl} />
        <Avatar.Fallback bg={theme.accent1 ?? theme.static2} />
      </Avatar>

      <YStack flex={1}>
        <XStack items="center" space="$2">
          {/* Tên nằm trên */}
          <Text fontWeight="700" color={theme.color1} fontSize="$5">
            {name}
          </Text>
        </XStack>

        <XStack items="center" space="$1" mt="$1">
          {/* Tin nhắn và thời gian nằm dưới, cùng hàng */}
          <Text
            color={theme.static1}
            fontSize="$3"
            opacity={0.9}
            numberOfLines={1}
            flex={1} // Thêm flex để tin nhắn chiếm hết không gian còn lại
          >
            {message}
          </Text>
          <Text color={theme.static1} fontSize="$2" opacity={0.8}>
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
  const themeValue = useThemeValue();
  const [, setTick] = React.useState(0);

  useEffect(() => {
    // force a re-render when themeValue changes
    setTick((t) => t + 1);
  }, [themeValue]);

  return (
    <SafeAreaVieww>
      <YStack flex={1} bg={theme.background} position="relative">
        <InboxHeader />
        <SearchBar />

        <ScrollView flex={1}>
          <YStack space="$1" py="$2">
            {dummyMessages.map((msg) => (
              <MessageListItem key={msg.id} {...msg} />
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </SafeAreaVieww>
  );
};

export default Inbox;
