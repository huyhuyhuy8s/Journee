import React from "react";
import {
  Avatar,
  Switch,
  Text,
  useTheme,
  View,
  XStack,
  YStack,
  Button,
  Separator,
} from "tamagui";
import { useThemeDispatch, useThemeValue } from "@/contexts/ThemeContext";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import { Link, router } from "expo-router";
import { useIsAuthenticated, useUser } from "@/contexts/UserContext";
import {
  LogIn,
  UserPlus,
  LogOut,
  User,
  Info, // Icon cho My Wall
  History, // Icon cho Timeline
  QrCode, // Icon cho QR User
  Settings, // Icon cho Setting
  ArrowRight, // Icon mũi tên bên trong Setting
  Moon, // Icon cho Dark Theme
} from "@tamagui/lucide-icons";
import { useAuth } from "@/utils/auth";
import { LinearGradient } from "expo-linear-gradient";

// --- 1. Custom Header Component ---
const AccountHeader = () => {
  const theme = useTheme();
  return (
    <XStack
      items="center"
      justify="center"
      py="$4"
      borderBottomWidth={1}
      borderColor={theme.static1}
    >
      <Text fontSize="$8" fontWeight="900" color={theme.color2}>
        Account
      </Text>
    </XStack>
  );
};

// --- 2. Custom Profile Button Component (Đã sửa Gradient và Viền) ---
interface ProfileButtonProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  showChevron?: boolean;
  isLogout?: boolean;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({
  icon,
  title,
  onPress,
  showChevron = false,
  isLogout = false,
}) => {
  const theme = useTheme();
  const borderRadius = 8;
  const height = 60;

  // 🟢 Điều chỉnh màu Gradient để rõ ràng hơn trong Dark Theme
  // Dùng màu tối hơn/sáng hơn để tăng độ tương phản với nền.
  const startColor = theme.color11.val || theme.background.val;
  const endColor = theme.static4.val || theme.background.val;
  // Log Out colors (đỏ nhạt hơn cho nền)
  const logoutStartColor = theme.red2.val || theme.background.val;
  const logoutEndColor = theme.red5.val || theme.background.val;

  const borderColor = isLogout
    ? String(theme.red4.val)
    : String(theme.color10.val);

  const gradientColors = isLogout
    ? [String(logoutStartColor), String(logoutEndColor)]
    : [String(startColor), String(endColor)];

  const color = isLogout ? theme.red10 : theme.color1;
  const iconColor = isLogout ? theme.red10 : theme.color1;

  return (
    // 🟢 LinearGradient bọc ngoài và áp dụng làm nền chính & Viền
    <LinearGradient
      colors={gradientColors}
      start={[0, 0]}
      end={[1, 1]}
      style={{
        borderRadius,
        height,
        // 🟢 Áp dụng Viền tại đây (đã sửa lỗi truyền màu)
        borderWidth: 1,
        borderColor: borderColor,
      }}
    >
      <Button
        onPress={onPress}
        chromeless
        px="$4"
        py="$3"
        borderRadius={borderRadius - 1}
        background="transparent"
        height={height - 2}
        alignSelf="stretch"
        margin={1}
        hoverStyle={{ background: "rgba(0,0,0,0.1)" }}
        pressStyle={{ background: "rgba(0,0,0,0.2)" }}
      >
        <XStack items="center" justify="space-between" flex={1}>
          {/* Icon và Title */}
          <XStack items="center" space="$3">
            {/* Icon (Căn trái) */}
            {React.cloneElement(icon as React.ReactElement, {
              size: 20,
              color: iconColor,
            })}
            <Text fontSize="$5" fontWeight="500" color={color}>
              {title}
            </Text>
          </XStack>

          {/* Chevron (Căn phải) */}
          {showChevron && <ArrowRight size={20} color={theme.color1} />}
        </XStack>
      </Button>
    </LinearGradient>
  );
};

// --- 3. Theme Toggle Button Component (Đã sửa Gradient và Viền) ---
const ThemeToggleButton = () => {
  const theme = useTheme();
  const themeDispatch = useThemeDispatch();
  const themeContext = useThemeValue();

  const isDark = themeContext === "dark";
  const [checked, setChecked] = React.useState<boolean>(isDark);

  React.useEffect(() => {
    // Đồng bộ trạng thái Switch với context
    setChecked(isDark);
  }, [isDark]);

  const handleThemeToggle = (val: boolean) => {
    setChecked(val);
    themeDispatch({ type: val ? "DARK" : "LIGHT" });
  };

  // 🟢 Điều chỉnh màu Gradient để rõ ràng hơn trong Dark Theme
  const startColor = theme.color11.val || theme.background.val;
  const endColor = theme.static4.val || theme.background.val;
  const gradientColors = [String(startColor), String(endColor)];
  const borderRadius = 8;
  const height = 60;
  const borderColor = String(theme.color10.val); // Sửa lỗi truyền màu

  return (
    // 🟢 LinearGradient bọc ngoài áp dụng cho toàn bộ khối nút toggle & Viền
    <LinearGradient
      colors={gradientColors}
      start={[0, 0]}
      end={[1, 1]}
      style={{
        borderRadius,
        height,
        // 🟢 Áp dụng Viền tại đây
        borderWidth: 1,
        borderColor: borderColor,
      }}
    >
      <XStack
        borderRadius={borderRadius - 1}
        overflow="hidden"
        height={height - 2}
        items="center"
        // Background là transparent để LinearGradient hiện ra
        bg="transparent"
        px="$4"
        alignSelf="stretch"
        margin={1}
      >
        <XStack items="center" space="$3" flex={1}>
          <Moon size={20} color={theme.color1} />
          <Text fontSize="$5" fontWeight="500" color={theme.color1}>
            Dark Mode
          </Text>
        </XStack>

        {/* Switch Component */}
        <Switch
          size="$4"
          checked={checked}
          borderColor={theme.static6}
          onCheckedChange={(val: boolean) => handleThemeToggle(val)}
          // 🟢 Dùng token màu động để Switch tự đổi màu theo theme
          backgroundColor={checked ? theme.static4 : theme.static1}
        >
          <Switch.Thumb animation="bouncy" />
        </Switch>
      </XStack>
    </LinearGradient>
  );
};

// --- Main Profile Component ---
const Profile = () => {
  const theme = useTheme();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Định nghĩa các mục menu
  const menuItems = [
    { title: "My Wall", icon: <Info />, onPress: () => router.push("/mywall") },
    { title: "Timeline", icon: <History />, onPress: () => alert("Timeline") },
    { title: "QR User", icon: <QrCode />, onPress: () => alert("QR User") },
    {
      title: "Setting",
      icon: <Settings />,
      onPress: () => router.push("/setting"),
      showChevron: true,
    },
    {
      title: "Log Out",
      icon: <LogOut />,
      onPress: handleLogout,
      isLogout: true,
    },
  ];

  return (
    <SafeAreaVieww>
      <YStack flex={1} bg={theme.background}>
        <AccountHeader />

        <YStack marginInline="$4" gap="$4" py="$4">
          {/* KHỐI NÚT CHỨC NĂNG 1 (My Wall, Timeline, QR User, Setting) */}
          {menuItems.slice(0, 4).map((item) => (
            <ProfileButton
              key={item.title}
              title={item.title}
              icon={item.icon}
              onPress={item.onPress}
              showChevron={item.showChevron}
            />
          ))}

          {/* 🟢 NÚT TOGGLE THEME */}
          <ThemeToggleButton />

          {/* KHỐI NÚT LOG OUT RIÊNG LẺ */}
          <ProfileButton
            title={menuItems[4].title}
            icon={menuItems[4].icon}
            onPress={menuItems[4].onPress}
            isLogout={menuItems[4].isLogout}
          />
        </YStack>
      </YStack>
    </SafeAreaVieww>
  );
};

export default Profile;
