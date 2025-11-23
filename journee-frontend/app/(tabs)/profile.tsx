import React from "react";
import { Avatar, Switch, Text, useTheme, View, XStack, YStack } from "tamagui";
import { useThemeDispatch, useThemeValue } from "@/contexts/ThemeContext";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import { Link, router } from "expo-router";
import { useIsAuthenticated, useUser } from "@/contexts/UserContext";
import LargeButton from "@/components/profile/LargeButton";
import { LogIn, UserPlus, LogOut, User } from "@tamagui/lucide-icons";
import { useAuth } from "@/utils/auth";

const Profile = () => {
  const theme = useTheme();
  const themeDispatch = useThemeDispatch();
  const themeContext = useThemeValue();

  const { logout } = useAuth();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <SafeAreaVieww>
      <View bg={theme.background} height="100%">
        <YStack marginInline="$4" gap="$4">
          {isAuthenticated ? (
            <>
              {/* User Profile Section */}
              {user && (
                <YStack
                  gap="$3"
                  paddingInline="$4"
                  bg={theme.backgroundHover}
                  borderRadius="$4"
                  marginBlockEnd="$2"
                >
                  <XStack gap="$3" items="center">
                    <Avatar circular size="$6">
                      <Avatar.Image src={user.avatar} />
                      <Avatar.Fallback backgroundColor={theme.accent1}>
                        <User color={theme.background} size="$2" />
                      </Avatar.Fallback>
                    </Avatar>
                    <YStack>
                      <Text
                        fontSize="$6"
                        fontWeight="bold"
                        color={theme.color1}
                      >
                        {user.name}
                      </Text>
                      <Text fontSize="$4" color={theme.color11}>
                        {user.email}
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>
              )}
              <LargeButton
                icon={<LogOut color={theme.background} />}
                title="LogOut"
                onPress={handleLogout}
              />
            </>
          ) : (
            <>
              <LargeButton
                icon={<LogIn color={theme.background} />}
                title="Login"
                onPress={() => {
                  router.push("/login");
                }}
              />
              <LargeButton
                icon={<UserPlus color={theme.background} />}
                title="Register"
                onPress={() => {
                  router.push("/register");
                }}
              />
            </>
          )}
          {/* <Link href="/login">Login</Link> */}
          <Switch
            size="$4"
            onCheckedChange={() => {
              themeDispatch({
                type: themeContext === "dark" ? "LIGHT" : "DARK",
              });
            }}
          >
            <Switch.Thumb animation="bouncy" />
          </Switch>
        </YStack>
      </View>
    </SafeAreaVieww>
  );
};

export default Profile;
