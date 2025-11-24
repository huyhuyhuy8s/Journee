import { Text } from "react-native";
import React, { useEffect, useState } from "react";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import MapView from "react-native-maps";
import * as Location from "expo-location";

const Map = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      console.log("🔍 Requesting location permissions...");

      // First, request foreground permissions
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        setErrorMsg("Foreground location permission was denied");
        return;
      }

      console.log("✅ Foreground permission granted");

      // Then, request background permissions (only if foreground is granted)
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== "granted") {
        console.log(
          "⚠️ Background location permission denied, but foreground is available"
        );
        setErrorMsg(
          "Background location permission denied. Some features may be limited."
        );
      } else {
        console.log("✅ Background permission granted");
      }

      setPermissionsGranted(true);
      getCurrentLocation();
    } catch (error) {
      console.error("❌ Error requesting location permissions:", error);
      setErrorMsg(`Permission error: ${error}`);
    }
  };

  const getCurrentLocation = async () => {
    try {
      console.log("📍 Getting current location...");

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(location);
      console.log("✅ Location obtained:", location.coords);
    } catch (error) {
      console.error("❌ Error getting location:", error);
      setErrorMsg(`Location error: ${error}`);
    }
  };

  let text = "Waiting for location...";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Lat: ${location.coords.latitude.toFixed(
      6
    )}, Lon: ${location.coords.longitude.toFixed(6)}`;
  }

  return (
    <SafeAreaVieww>
      <MapView
        style={{ width: "100%", height: "100%" }}
        region={{
          latitude: location ? location.coords.latitude : 37.78825,
          longitude: location ? location.coords.longitude : -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      />
      <Text
        style={{
          position: "absolute",
          bottom: 50,
          left: 10,
          backgroundColor: "rgba(255,255,255,0.8)",
          padding: 10,
          borderRadius: 5,
        }}
      >
        {text}
      </Text>
    </SafeAreaVieww>
  );
};

export default Map;
