import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch, useTheme, View } from "tamagui";

const Profile = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ backgroundColor: theme.color1.val }}>
      <View bg={theme.color1} height="100%">
        <Switch size="$4">
          <Switch.Thumb animation="bouncy" />
        </Switch>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
