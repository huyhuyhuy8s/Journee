import React from "react";
import { Switch, useTheme, View } from "tamagui";
import { useThemeDispatch, useThemeValue } from "../ThemeContext";
import SafeAreaVieww from "@/components/SafeAreaVieww";

const Profile = () => {
  const theme = useTheme();
  const themeDispatch = useThemeDispatch();
  const themeContext = useThemeValue();

  return (
    <SafeAreaVieww>
      <View bg={theme.color1} height="100%">
        <Switch
          size="$4"
          onCheckedChange={() => {
            themeDispatch({ type: themeContext === "dark" ? "LIGHT" : "DARK" });
          }}
        >
          <Switch.Thumb animation="bouncy" />
        </Switch>
      </View>
    </SafeAreaVieww>
  );
};

export default Profile;
