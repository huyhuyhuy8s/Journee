import { Text } from "react-native";
import React from "react";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import MapView from "react-native-maps";

const Map = () => {
  return (
    <SafeAreaVieww>
      <MapView style={{ width: "100%", height: "100%" }} />
      <Text>Map</Text>
    </SafeAreaVieww>
  );
};

export default Map;
