import React, { useState, FunctionComponent, useRef, useEffect } from "react";
import {
  Text,
  useTheme,
  XStack,
  YStack,
  Button,
  Avatar,
  Separator,
  ScrollView,
  Image,
} from "tamagui";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import {
  Search,
  ChevronLeft,
  Menu,
  BarChart2,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Send,
  PlusCircle,
} from "@tamagui/lucide-icons";
import { router, useNavigation } from "expo-router";
// added native imports for draggable floating button
import {
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";

// --- Dữ liệu Mẫu ---
const USER_DATA = {
  name: "Nguyễn Lê Tùng Chi",
  username: "jasmine.yu_r_",
  followers: 120,
  bio: "✨ jasmine 🤍🎀 ☆\nL'espoir",
  avatarUri: "https://picsum.photos/seed/tungchi/100",
  // Dữ liệu bài đăng mẫu
  posts: [
    {
      id: 1,
      content: "Có gì mới?",
      time: "2 ngày trước",
      type: "text",
      likes: 6,
      comments: 3,
      imageUri: "https://picsum.photos/seed/post1/500/300",
    },
    {
      id: 2,
      content: "Morning text kiểu =))",
      time: "11/11/25",
      type: "chat",
      imageUri: "https://picsum.photos/seed/post2_chat/400/500",
      likes: 6,
      comments: 3,
    },
  ],
};

// --- 1. Custom Header ---
const ProfileHeader = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const handleBack = () => {
    console.log("Navigating back to Setting or previous screen");
    router.push("/profile"); // Uncomment nếu bạn muốn ép buộc về setting
  };
  return (
    <XStack
      items="center"
      justify="space-between"
      px="$4"
      py="$3"
      bg={theme.background}
    >
      {/* Icon Profile */}
      {/* <YStack width={24} height={24} mr="$2" justify="center" items="center">
        <Button chromeless icon={<ChevronLeft size={24} color={theme.color1} />} onPress={handleBack} p={0} />
      </YStack> */}

      <Button
        chromeless
        icon={<ChevronLeft size={24} color={theme.color1} />}
        onPress={handleBack}
        p={0}
      />

      {/* Tên */}
      <Text fontSize="$7" fontWeight="bold" color={theme.color1} flex={1}>
        My Wall
      </Text>

      {/* Icons Phải */}
      <XStack space="$3" items="center">
        <Search size={24} color={theme.color1} />
        <Menu
          size={24}
          color={theme.color1}
          onPress={() => router.push("/setting")}
        />
      </XStack>
    </XStack>
  );
};

// --- 2. Action Buttons ---
const ActionButtons = () => {
  const theme = useTheme();

  return (
    <XStack space="$2" mt="$3" px="$4">
      <Button
        flex={1}
        size="$3"
        bg={theme.static4} // Màu nền đậm hơn
        color={theme.color1}
        fontWeight="bold"
        onPress={() => console.log("Chỉnh sửa")}
      >
        Chỉnh sửa trang cá nhân
      </Button>
      <Button
        flex={1}
        size="$3"
        bg={theme.static4}
        color={theme.color1}
        fontWeight="bold"
        onPress={() => console.log("Chia sẻ")}
      >
        Chia sẻ trang cá nhân
      </Button>
    </XStack>
  );
};

// --- 3. Tab Navigation ---
const TabBar = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
}) => {
  const theme = useTheme();
  const tabs = ["Feed", "Journal"];

  return (
    <XStack
      mt="$5"
      px="$4"
      borderBottomWidth="$0.5"
      borderColor={theme.static1}
      justify="space-around"
    >
      {tabs.map((tab, index) => (
        <Button
          key={tab}
          chromeless
          py="$2"
          onPress={() => setActiveTab(tab)}
          borderBottomWidth={1}
          //borderColor={activeTab === tab ? theme.color1 : "transparent"}
        >
          <Text
            fontSize="$4"
            fontWeight="bold"
            color={activeTab === tab ? theme.color1 : theme.static1}
          >
            {tab}
          </Text>
        </Button>
      ))}
    </XStack>
  );
};

// --- 4. Post Item Component ---
const PostItem = ({ post }: { post: any }) => {
  const theme = useTheme();

  const handleLike = () => console.log(`Liked post ${post.id}`);
  const handleComment = () => console.log(`Commented on post ${post.id}`);
  const handleShare = () => console.log(`Shared post ${post.id}`);

  return (
    <YStack
      borderBottomWidth={1}
      borderColor={theme.static8}
      pb="$4"
      pt="$4"
      px="$4"
    >
      {/* Post Header */}
      <XStack space="$1" items="center" mb="$0">
        {" "}
        {/* 🟢 THÊM mb="$3" cho header */}
        <Avatar circular size="$4">
          <Avatar.Image src={USER_DATA.avatarUri} />
          <Avatar.Fallback bg={theme.static1} />
        </Avatar>
        <Text fontWeight="bold" color={theme.color1} fontSize="$4" ml="$3">
          {USER_DATA.username}
        </Text>
        <Text color={theme.static9} fontSize="$3">
          {post.time}
        </Text>
      </XStack>

      {/* 2. Content: Caption, Image, Chat Box */}
      {/* ml="$7" tạo indent cho nội dung so với Avatar */}
      <YStack ml="$9" mr="$1">
        {/* Caption (Content Text) */}
        <Text color={theme.color1} fontSize="$4" mb="$4">
          {" "}
          {/* 🟢 Dùng mb="$3" tạo khoảng cách dưới caption */}
          {post.content}
        </Text>

        {/* Hình ảnh (Nếu có) */}
        {post.imageUri && (
          <YStack
            borderRadius="$3"
            overflow="hidden"
            mb={post.type === "chat" ? "$3" : "$4"} // 🟢 Thêm khoảng cách dưới ảnh
          >
            <Image
              source={{ uri: post.imageUri }}
              style={{ width: "100%", height: 200 }}
              resizeMode="cover"
            />
          </YStack>
        )}
      </YStack>

      {/* 3. Actions: Like/Comment/Share */}
      {/* Không cần ml="$7" nếu đã dùng flex: 1 cho nội dung */}
      <XStack space="$4" items="center" ml="$9">
        {/* Likes */}
        <XStack items="center" space="$1">
          <Heart size={20} color={theme.color3} onPress={handleLike} />
          <Text color={theme.color3} fontSize="$3">
            {post.likes}
          </Text>
        </XStack>
        <XStack items="center" space="$1">
          <MessageCircle
            size={20}
            color={theme.color3}
            onPress={handleComment}
          />
          <Text color={theme.color3} fontSize="$3">
            {post.comments}
          </Text>
        </XStack>
        <Send size={20} color={theme.color3} onPress={handleShare} />
      </XStack>
    </YStack>
  );
};

// --- REMOVE BottomBar component and replace with a draggable floating assistive touch button ---
const FloatingAssistiveTouch = () => {
  const theme = useTheme();
  const { width, height } = Dimensions.get("window");
  const SIZE = 64;
  const MARGIN = 16;
  // initial position (bottom-right)
  const initialX = width - SIZE - MARGIN;
  const initialY = height - SIZE - 140;

  const pan = useRef(
    new Animated.ValueXY({ x: initialX, y: initialY })
  ).current;

  useEffect(() => {
    // Ensure initial placement on mount
    pan.setValue({ x: initialX, y: initialY });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // set offset so movement accumulates
        // @ts-ignore access internal value for offset
        pan.setOffset({ x: (pan as any).x._value, y: (pan as any).y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_evt, gestureState) => {
        pan.flattenOffset();
        // snap to nearest horizontal edge
        const toX =
          gestureState.moveX > width / 2 ? width - SIZE - MARGIN : MARGIN;
        // clamp Y so button stays on screen
        const topLimit = MARGIN;
        const bottomLimit =
          height - SIZE - MARGIN - (Platform.OS === "ios" ? 34 : 0);
        const toY = Math.min(
          Math.max(gestureState.moveY - SIZE / 2, topLimit),
          bottomLimit
        );

        Animated.spring(pan, {
          toValue: { x: toX, y: toY },
          useNativeDriver: false,
          bounciness: 6,
        }).start();
      },
    })
  ).current;

  const handlePress = () => {
    router.push("/NewPost");
  };

  return (
    <Animated.View
      // attach pan handlers here
      {...panResponder.panHandlers}
      style={[
        {
          position: "absolute",
          zIndex: 999,
          // fallback if transform is not set yet
          left: 0,
          top: 0,
        },
        // animated translate
        { transform: pan.getTranslateTransform() },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          backgroundColor: theme.background,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 8,
        }}
      >
        <PlusCircle size={36} color={theme.static1} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Main ProfileWall Component ---
const ProfileWall = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("Feed"); // Tab mặc định

  return (
    <SafeAreaVieww>
      <YStack flex={1} bg={theme.background}>
        <ProfileHeader />

        <ScrollView flex={1}>
          {/* User Info Section */}
          <YStack px="$4" pb="$4">
            <XStack justify="space-between" items="flex-start">
              {/* Name & Username */}
              <YStack flex={1} pr="$4">
                <Text fontSize="$6" fontWeight="bold" color={theme.color1}>
                  {USER_DATA.name}
                </Text>
                <Text fontSize="$4" color={theme.static9} mt="$-1">
                  {USER_DATA.username}
                </Text>
                {/* Bio/Tình trạng */}
                <Text fontSize="$4" color={theme.color1} mt="$1">
                  {USER_DATA.bio}
                </Text>
                {/* Followers */}
                <Text fontSize="$4" color={theme.static1} mt="$2">
                  <Text fontWeight="bold" color={theme.color1}>
                    {USER_DATA.followers}
                  </Text>{" "}
                  người theo dõi
                </Text>
              </YStack>

              {/* Avatar */}
              <Avatar circular size="$8">
                <Avatar.Image src={USER_DATA.avatarUri} />
                <Avatar.Fallback bg={theme.static1} />
              </Avatar>
            </XStack>

            {/* Action Buttons */}
            <ActionButtons />
          </YStack>

          {/* Tab Navigation */}
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Content Feed */}
          <YStack>
            {/* Chỉ hiển thị nội dung nếu Tab là Thread (giả định) */}
            {activeTab === "Feed" && (
              <YStack>
                {USER_DATA.posts.map((post) => (
                  <PostItem key={post.id} post={post} />
                ))}
              </YStack>
            )}
            {/* Thêm logic cho các tab khác nếu cần */}
          </YStack>
        </ScrollView>

        {/* REPLACED: remove BottomBar and render floating assistive touch */}
        <FloatingAssistiveTouch />
      </YStack>
    </SafeAreaVieww>
  );
};

export default ProfileWall;
