import tamaguiConfig from "@/tamagui.config";
import { ToastProvider } from "@tamagui/toast";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PortalProvider, TamaguiProvider } from "tamagui";
import { ThemeContextProvider, useThemeValue } from "./ThemeContext";

SplashScreen.preventAutoHideAsync();

// Create a separate component that uses the theme context
const AppContent = () => {
  const theme = useThemeValue();

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
        <PortalProvider>
          <ToastProvider>
            <StatusBar />
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{
                  title: "Home",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="login"
                options={{
                  title: "Login",
                  headerShown: false,
                }}
              />
            </Stack>
          </ToastProvider>
        </PortalProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
};

export default () => {
  const [fontLoaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (fontLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontLoaded]);

  if (!fontLoaded) {
    return null;
  }

  return (
    <ThemeContextProvider>
      <AppContent />
    </ThemeContextProvider>
  );
};
