import tamaguiConfig from "@/tamagui.config";
import { ToastProvider } from "@tamagui/toast";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { PortalProvider, TamaguiProvider } from "tamagui";

SplashScreen.preventAutoHideAsync();

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
    <SafeAreaProvider>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <PortalProvider>
          <ToastProvider>
            <StatusBar />
            <Stack>
              <Stack.Screen
                name="(tabs)"
                options={{
                  title: "Home",
                  // statusBarHidden: true,
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="login"
                options={{
                  title: "Login",
                  // statusBarHidden: true,
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
