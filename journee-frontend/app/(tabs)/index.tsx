import { ColorValue, StyleSheet, Text } from "react-native";
import React, { useEffect, useState } from "react";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import MapView, { Region } from "react-native-maps";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "tamagui";

const BACKGROUND_LOCATION_TASK = "background-location";

const STORAGE_KEYS = {
  LAST_LOCATION: "lastBackgroundLocation",
  LAST_SPEED: "lastSpeed",
  MOVEMENT_STATE: "movementState",
  STATE_CHANGE_TIME: "stateChangeTime",
  STATE_STABILITY_BUFFER: "stateStabilityBuffer",
  UPDATE_INTERVAL: "updateInterval",
};

const STATE_STABILITY_CONFIG = {
  MIN_DURATION_MS: 5 * 60 * 1000,
  SAMPLE_BUFFER_SIZE: 10,
};

const MOVEMENT_STATES = {
  STATIONARY: {
    name: "STATIONARY",
    threshold: 0,
    updateInterval: 3600000,
    distanceInterval: 200,
    accuracy: Location.Accuracy.Balanced,
  },
  SLOW_MOVING: {
    name: "SLOW_MOVING",
    threshold: 1,
    updateInterval: 1800000,
    distanceInterval: 100,
    accuracy: Location.Accuracy.Balanced,
  },
  FAST_MOVING: {
    name: "FAST_MOVING",
    threshold: 5,
    updateInterval: 5000,
    distanceInterval: 20,
    accuracy: Location.Accuracy.High,
  },
};

// ✅ Ensure task is defined before any component loads
TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  ({ data, error }: { data: any; error: any }) => {
    console.log("🌙 Background task triggered:", new Date().toISOString());

    if (error) {
      console.error("❌ Background location error:", error);
      return;
    }

    if (data) {
      const { locations } = data as { locations: Location.LocationObject[] };
      if (locations && locations[0]) {
        console.log("📍 Processing location:", {
          lat: locations[0].coords.latitude.toFixed(6),
          lng: locations[0].coords.longitude.toFixed(6),
          accuracy: locations[0].coords.accuracy,
        });
        handleBackgroundLocation(locations[0]);
      }
    }
  }
);

const handleBackgroundLocation = async (location: Location.LocationObject) => {
  try {
    console.log("🔄 Processing background location...");

    const lastLocationStr = await AsyncStorage.getItem(
      STORAGE_KEYS.LAST_LOCATION
    );
    const lastMovementState = await AsyncStorage.getItem(
      STORAGE_KEYS.MOVEMENT_STATE
    );
    const stateChangeTimeStr = await AsyncStorage.getItem(
      STORAGE_KEYS.STATE_CHANGE_TIME
    );
    const stabilityBufferStr = await AsyncStorage.getItem(
      STORAGE_KEYS.STATE_STABILITY_BUFFER
    );

    let previousLocation: Location.LocationObject | null = null;
    if (lastLocationStr) {
      previousLocation = JSON.parse(lastLocationStr);
    }

    let stateChangeTime = stateChangeTimeStr
      ? parseInt(stateChangeTimeStr)
      : Date.now();
    let speedBuffer: number[] = stabilityBufferStr
      ? JSON.parse(stabilityBufferStr)
      : [];

    const movementAnalysis = await analyzeMovement(location, previousLocation);

    speedBuffer.push(movementAnalysis.currentSpeed);
    if (speedBuffer.length > STATE_STABILITY_CONFIG.SAMPLE_BUFFER_SIZE) {
      speedBuffer = speedBuffer.slice(
        -STATE_STABILITY_CONFIG.SAMPLE_BUFFER_SIZE
      );
    }

    const averageSpeed =
      speedBuffer.reduce((sum, speed) => sum + speed, 0) / speedBuffer.length;
    const potentialNewState = determineMovementState(averageSpeed);
    const currentState = lastMovementState || "FAST_MOVING";
    const timeSinceLastChange = Date.now() - stateChangeTime;

    console.log("📊 State Analysis:", {
      currentSpeed: movementAnalysis.currentSpeed.toFixed(2) + " km/h",
      averageSpeed: averageSpeed.toFixed(2) + " km/h",
      currentState,
      potentialNewState: potentialNewState.name,
      timeSinceLastChange: Math.round(timeSinceLastChange / 1000) + "s",
    });

    let finalState = currentState;
    let shouldChangeState = false;

    if (potentialNewState.name !== currentState) {
      const hasMetMinDuration =
        timeSinceLastChange >= STATE_STABILITY_CONFIG.MIN_DURATION_MS;

      if (hasMetMinDuration) {
        const isConsistentChange = await validateStateChange(
          currentState,
          potentialNewState.name,
          speedBuffer,
          averageSpeed
        );

        if (isConsistentChange) {
          finalState = potentialNewState.name;
          shouldChangeState = true;
          stateChangeTime = Date.now();
          console.log(
            `✅ State change approved: ${currentState} → ${finalState}`
          );
        } else {
          console.log(`⏸️ State change rejected: inconsistent data`);
        }
      } else {
        const remainingTime = Math.round(
          (STATE_STABILITY_CONFIG.MIN_DURATION_MS - timeSinceLastChange) / 1000
        );
        console.log(`⏳ State change pending: ${remainingTime}s remaining`);
      }
    } else {
      console.log(`✅ State confirmed: ${currentState}`);
    }

    // Save all data
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_LOCATION,
      JSON.stringify(location)
    );
    await AsyncStorage.setItem(STORAGE_KEYS.MOVEMENT_STATE, finalState);
    await AsyncStorage.setItem(
      STORAGE_KEYS.STATE_CHANGE_TIME,
      stateChangeTime.toString()
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.STATE_STABILITY_BUFFER,
      JSON.stringify(speedBuffer)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_SPEED,
      averageSpeed.toString()
    );

    // Update UI data
    await AsyncStorage.setItem(
      "uiUpdateData",
      JSON.stringify({
        movementState: finalState,
        currentSpeed: movementAnalysis.currentSpeed,
        averageSpeed,
        timeSinceStateChange: timeSinceLastChange,
        timestamp: Date.now(),
      })
    );

    // ✅ ALWAYS restart tracking with correct interval - not just on state change
    console.log(`🔄 Ensuring correct tracking interval for ${finalState}...`);
    await restartBackgroundTrackingWithNewInterval(
      Object.values(MOVEMENT_STATES).find((s) => s.name === finalState) ||
        MOVEMENT_STATES.FAST_MOVING
    );

    await storeLocationData({
      ...location,
      movementState: finalState,
      speed: movementAnalysis.currentSpeed,
      averageSpeed,
      timeSinceStateChange: timeSinceLastChange,
    });
  } catch (error) {
    console.error("❌ Error handling background location:", error);
  }
};

const validateStateChange = async (
  currentState: string,
  newState: string,
  speedBuffer: number[],
  averageSpeed: number
): Promise<boolean> => {
  if (speedBuffer.length < 3) return false;

  const maxSpeed = Math.max(...speedBuffer);
  const minSpeed = Math.min(...speedBuffer);

  console.log(`🔍 Validating ${currentState} → ${newState}:`, {
    avgSpeed: averageSpeed.toFixed(2),
    maxSpeed: maxSpeed.toFixed(2),
    minSpeed: minSpeed.toFixed(2),
  });

  switch (`${currentState}->${newState}`) {
    case "FAST_MOVING->STATIONARY":
      const isStationary = averageSpeed < 0.5 && maxSpeed < 2;
      console.log(
        `📍 STATIONARY check: avgSpeed < 0.5 (${averageSpeed.toFixed(
          2
        )}) && maxSpeed < 2 (${maxSpeed.toFixed(2)}) = ${isStationary}`
      );
      return isStationary;

    case "FAST_MOVING->SLOW_MOVING":
      const isSlow = averageSpeed < 3 && maxSpeed < 5;
      console.log(
        `🚶 SLOW_MOVING check: avgSpeed < 3 (${averageSpeed.toFixed(
          2
        )}) && maxSpeed < 5 (${maxSpeed.toFixed(2)}) = ${isSlow}`
      );
      return isSlow;

    case "SLOW_MOVING->STATIONARY":
      const isStationaryFromSlow = averageSpeed < 0.5 && maxSpeed < 1;
      console.log(
        `📍 STATIONARY from SLOW check: avgSpeed < 0.5 (${averageSpeed.toFixed(
          2
        )}) && maxSpeed < 1 (${maxSpeed.toFixed(2)}) = ${isStationaryFromSlow}`
      );
      return isStationaryFromSlow;

    case "STATIONARY->SLOW_MOVING":
      const isSlowFromStationary = averageSpeed > 1 && minSpeed > 0.5;
      console.log(
        `🚶 SLOW from STATIONARY check: avgSpeed > 1 (${averageSpeed.toFixed(
          2
        )}) && minSpeed > 0.5 (${minSpeed.toFixed(
          2
        )}) = ${isSlowFromStationary}`
      );
      return isSlowFromStationary;

    case "STATIONARY->FAST_MOVING":
    case "SLOW_MOVING->FAST_MOVING":
      const isFast = averageSpeed > 5 && minSpeed > 3;
      console.log(
        `🏃 FAST_MOVING check: avgSpeed > 5 (${averageSpeed.toFixed(
          2
        )}) && minSpeed > 3 (${minSpeed.toFixed(2)}) = ${isFast}`
      );
      return isFast;

    default:
      console.log(
        `✅ Default validation passed for ${currentState} → ${newState}`
      );
      return true;
  }
};

const analyzeMovement = async (
  currentLocation: Location.LocationObject,
  previousLocation: Location.LocationObject | null
): Promise<{
  currentSpeed: number;
  distanceTraveled: number;
  timeDelta: number;
}> => {
  let currentSpeed = 0;
  let distanceTraveled = 0;
  let timeDelta = 0;

  if (previousLocation) {
    timeDelta = (currentLocation.timestamp - previousLocation.timestamp) / 1000;
    distanceTraveled = calculateDistance(
      previousLocation.coords.latitude,
      previousLocation.coords.longitude,
      currentLocation.coords.latitude,
      currentLocation.coords.longitude
    );

    if (timeDelta > 0) {
      currentSpeed = (distanceTraveled / timeDelta) * 3.6;
    }
  }

  if (currentLocation.coords.speed && currentLocation.coords.speed >= 0) {
    const gpsSpeed = currentLocation.coords.speed * 3.6;
    currentSpeed = Math.max(currentSpeed, gpsSpeed);
  }

  return {
    currentSpeed: Math.max(0, currentSpeed),
    distanceTraveled: Math.max(0, distanceTraveled),
    timeDelta: Math.max(0, timeDelta),
  };
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const determineMovementState = (speed: number) => {
  if (speed >= MOVEMENT_STATES.FAST_MOVING.threshold) {
    return MOVEMENT_STATES.FAST_MOVING;
  } else if (speed >= MOVEMENT_STATES.SLOW_MOVING.threshold) {
    return MOVEMENT_STATES.SLOW_MOVING;
  } else {
    return MOVEMENT_STATES.STATIONARY;
  }
};

const restartBackgroundTrackingWithNewInterval = async (
  newState: typeof MOVEMENT_STATES.FAST_MOVING
) => {
  try {
    // Check current configuration
    const currentConfig = await AsyncStorage.getItem("currentTrackingConfig");
    const newConfigStr = JSON.stringify({
      name: newState.name,
      updateInterval: newState.updateInterval,
      distanceInterval: newState.distanceInterval,
    });

    // ✅ Only restart if configuration actually changed
    if (currentConfig === newConfigStr) {
      console.log(
        `⚡ Already using ${newState.name} configuration - no restart needed`
      );
      return;
    }

    console.log(
      `🔄 Restarting tracking: ${
        currentConfig ? JSON.parse(currentConfig).name : "unknown"
      } → ${newState.name}`
    );
    console.log(
      `⏰ New intervals: ${newState.updateInterval / 1000}s time, ${
        newState.distanceInterval
      }m distance`
    );

    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK
    );
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log("⏸️ Stopped previous tracking");
    }

    // ✅ Wait before restarting to ensure clean stop
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: newState.accuracy,
      timeInterval: newState.updateInterval,
      distanceInterval: newState.distanceInterval,
      foregroundService: {
        notificationTitle: "Journey Tracker",
        notificationBody: `${newState.name.replace(
          "_",
          " "
        )} - ${getIntervalText(newState.updateInterval)} updates`,
        notificationColor: getNotificationColor(newState.name),
      },
      deferredUpdatesInterval: newState.updateInterval,
      deferredUpdatesDistance: newState.distanceInterval,
      pausesUpdatesAutomatically: false,
      activityType: getActivityType(newState.name),
    });

    // ✅ Save current configuration
    await AsyncStorage.setItem("currentTrackingConfig", newConfigStr);

    console.log(
      `✅ Tracking restarted successfully with ${
        newState.name
      } (${getIntervalText(newState.updateInterval)})`
    );
  } catch (error) {
    console.error("❌ Error restarting tracking:", error);
  }
};

const getNotificationColor = (stateName: string): string => {
  switch (stateName) {
    case "FAST_MOVING":
      return "#FF6B6B";
    case "SLOW_MOVING":
      return "#4ECDC4";
    case "STATIONARY":
      return "#45B7D1";
    default:
      return "#007AFF";
  }
};

const getActivityType = (stateName: string): Location.ActivityType => {
  switch (stateName) {
    case "FAST_MOVING":
      return Location.ActivityType.AutomotiveNavigation;
    case "SLOW_MOVING":
      return Location.ActivityType.Fitness;
    case "STATIONARY":
      return Location.ActivityType.Other;
    default:
      return Location.ActivityType.Other;
  }
};

const getIntervalText = (interval: number): string => {
  if (interval >= 3600000) return `${interval / 3600000}h`;
  if (interval >= 60000) return `${interval / 60000}min`;
  return `${interval / 1000}s`;
};

const storeLocationData = async (locationData: any) => {
  try {
    const existingData = await AsyncStorage.getItem("locationHistory");
    const history = existingData ? JSON.parse(existingData) : [];

    history.push({
      ...locationData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    });

    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }

    await AsyncStorage.setItem("locationHistory", JSON.stringify(history));
    console.log("💾 Location stored");
  } catch (error) {
    console.error("❌ Error storing location:", error);
  }
};

interface IOpenMapsAddress {
  address: string;
  name: string;
}

interface IAddress {
  place: string;
  value: string;
}

const Map = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [foregroundPermission, setForegroundPermission] =
    useState<Location.PermissionStatus>(Location.PermissionStatus.UNDETERMINED);
  const [backgroundPermission, setBackgroundPermission] =
    useState<Location.PermissionStatus>(Location.PermissionStatus.UNDETERMINED);
  const [isLocationPermitted, setIsLocationPermitted] =
    useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 10.794847,
    longitude: 106.6426474,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [address, setAddress] = useState<IAddress | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackgroundTracking, setIsBackgroundTracking] =
    useState<boolean>(false);
  const [currentMovementState, setCurrentMovementState] =
    useState<string>("FAST_MOVING");
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [timeSinceStateChange, setTimeSinceStateChange] = useState<number>(0);

  const OPEN_MAPS_API_BASE_URL = "https://mapapis.openmap.vn/v1";
  const OPEN_MAPS_API_KEY = process.env.EXPO_PUBLIC_OPEN_MAPS_API_KEY;

  useEffect(() => {
    const updateUIFromBackground = async () => {
      try {
        const uiData = await AsyncStorage.getItem("uiUpdateData");
        if (uiData) {
          const data = JSON.parse(uiData);
          setCurrentMovementState(data.movementState);
          setCurrentSpeed(data.currentSpeed);
          setTimeSinceStateChange(data.timeSinceStateChange);
        }
      } catch (error) {
        console.error("❌ Error updating UI:", error);
      }
    };

    updateUIFromBackground();
    const interval = setInterval(updateUIFromBackground, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initializeLocationServices = async () => {
      try {
        setIsLoading(true);

        const permissionGranted = await requestPermissions();
        if (!permissionGranted) {
          setIsLoading(false);
          return;
        }

        const currentLocation = await getCurrentLocation();
        if (currentLocation) {
          await updateMapRegion(currentLocation);
          await getCurrentAddress(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude
          );
        }

        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error initializing:", error);
        setIsLoading(false);
      }
    };

    if (!isLocationPermitted) {
      initializeLocationServices();
    }
  }, [isLocationPermitted]);

  const requestPermissions = async () => {
    try {
      const foregroundResult =
        await Location.requestForegroundPermissionsAsync();
      setForegroundPermission(foregroundResult.status);

      if (foregroundResult.status !== Location.PermissionStatus.GRANTED) {
        setErrorMsg("Foreground permission denied");
        return false;
      }

      setIsLocationPermitted(true);

      const backgroundResult =
        await Location.requestBackgroundPermissionsAsync();
      setBackgroundPermission(backgroundResult.status);

      if (backgroundResult.status !== Location.PermissionStatus.GRANTED) {
        setErrorMsg("Background permission denied");
      }

      return true;
    } catch (error) {
      console.error("❌ Error requesting permissions:", error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(locationResult);
      return locationResult;
    } catch (error) {
      console.error("❌ Error getting location:", error);
      return null;
    }
  };

  const updateMapRegion = async (location: Location.LocationObject) => {
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const getCurrentAddress = async (latitude: number, longitude: number) => {
    try {
      const expoAddress = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (expoAddress[0]) {
        setAddress({
          place: expoAddress[0].name || "Unknown Place",
          value: expoAddress[0].formattedAddress || "Unknown Address",
        });
      }
    } catch (error) {
      console.error("❌ Error getting address:", error);
    }
  };

  const startBackgroundLocationTracking = async (): Promise<void> => {
    try {
      console.log("🌙 Starting background tracking...");

      const isTaskDefined = TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);
      if (!isTaskDefined) {
        console.error("❌ Task not defined");
        return;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      );
      if (hasStarted) {
        console.log("⚠️ Already started");
        setIsBackgroundTracking(true);
        return;
      }

      const backgroundStatus = await Location.getBackgroundPermissionsAsync();
      if (backgroundStatus.status !== Location.PermissionStatus.GRANTED) {
        setErrorMsg("Background permission required");
        return;
      }

      // ✅ Clear previous tracking config to force restart
      await AsyncStorage.removeItem("currentTrackingConfig");

      const initialState = MOVEMENT_STATES.FAST_MOVING;

      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: initialState.accuracy,
        timeInterval: initialState.updateInterval,
        distanceInterval: initialState.distanceInterval,
        foregroundService: {
          notificationTitle: "Journey Tracker",
          notificationBody: `${initialState.name.replace(
            "_",
            " "
          )} - ${getIntervalText(initialState.updateInterval)} updates`,
          notificationColor: "#007AFF",
        },
        pausesUpdatesAutomatically: false,
        activityType: Location.ActivityType.Other,
      });

      // ✅ Save initial configuration
      await AsyncStorage.setItem(
        "currentTrackingConfig",
        JSON.stringify({
          name: initialState.name,
          updateInterval: initialState.updateInterval,
          distanceInterval: initialState.distanceInterval,
        })
      );

      setIsBackgroundTracking(true);
      console.log(
        `✅ Background tracking started with ${
          initialState.name
        } (${getIntervalText(initialState.updateInterval)})`
      );
    } catch (error) {
      console.error("❌ Error starting tracking:", error);
      setErrorMsg(`Tracking error: ${error}`);
    }
  };

  const stopBackgroundLocationTracking = async (): Promise<void> => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }
      setIsBackgroundTracking(false);

      await AsyncStorage.removeItem(STORAGE_KEYS.MOVEMENT_STATE);
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SPEED);
      await AsyncStorage.removeItem(STORAGE_KEYS.STATE_CHANGE_TIME);
      await AsyncStorage.removeItem(STORAGE_KEYS.STATE_STABILITY_BUFFER);
    } catch (error) {
      console.error("❌ Error stopping tracking:", error);
    }
  };

  const getMovementStateInfo = () => {
    const stateConfig = Object.values(MOVEMENT_STATES).find(
      (s) => s.name === currentMovementState
    );
    if (!stateConfig)
      return { color: "#999", text: "Unknown", speed: "0 km/h", stability: "" };

    const intervalText =
      stateConfig.updateInterval >= 3600000
        ? `${stateConfig.updateInterval / 3600000}h`
        : stateConfig.updateInterval >= 60000
        ? `${stateConfig.updateInterval / 60000}min`
        : `${stateConfig.updateInterval / 1000}s`;

    const stabilityTime = Math.round(timeSinceStateChange / 1000);
    const minTime = Math.round(STATE_STABILITY_CONFIG.MIN_DURATION_MS / 1000);
    const isStable = stabilityTime >= minTime;
    const stabilityIndicator = isStable ? "🔒" : "⏳";

    return {
      color: getNotificationColor(currentMovementState),
      text: `${currentMovementState.replace("_", " ")} (${intervalText})`,
      speed: currentSpeed.toFixed(1) + " km/h",
      stability: `${stabilityIndicator} ${stabilityTime}/${minTime}s`,
    };
  };

  const movementInfo = getMovementStateInfo();

  return (
    <SafeAreaVieww>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      />

      {isBackgroundTracking ? (
        <Button
          onPress={stopBackgroundLocationTracking}
          style={{
            position: "absolute",
            top: 50,
            right: 10,
            backgroundColor: "#FF6B6B",
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            {"Stop\nTracking"}
          </Text>
        </Button>
      ) : (
        <Button
          onPress={startBackgroundLocationTracking}
          style={{
            position: "absolute",
            top: 50,
            right: 10,
            backgroundColor: "#4CAF50",
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            {"Start\nTracking"}
          </Text>
        </Button>
      )}

      <Text
        style={{
          position: "absolute",
          top: 100,
          right: 10,
          backgroundColor: movementInfo.color,
          color: "white",
          padding: 8,
          borderRadius: 5,
          fontSize: 12,
          textAlign: "center",
        }}
      >
        {movementInfo.text}
        {"\n"}
        {movementInfo.speed}
        {"\n"}
        {movementInfo.stability}
      </Text>

      {errorMsg && (
        <Text
          style={{
            position: "absolute",
            top: 100,
            left: 10,
            backgroundColor: "rgba(255, 136, 136, 0.8)",
            padding: 10,
            borderRadius: 5,
          }}
        >
          {errorMsg}
        </Text>
      )}

      {address && (
        <Text
          style={{
            position: "absolute",
            top: 50,
            left: 10,
            maxWidth: "50%",
            backgroundColor: "rgba(255,255,255,0.8)",
            padding: 10,
            borderRadius: 5,
          }}
        >
          {`Place: ${address.place}\nAddress: ${address.value}`}
        </Text>
      )}

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
        {location
          ? `Lat: ${location.coords.latitude.toFixed(
              6
            )}, Lon: ${location.coords.longitude.toFixed(6)}`
          : "Waiting for location..."}
      </Text>
    </SafeAreaVieww>
  );
};

const styles = StyleSheet.create({
  map: { width: "100%", height: "95%" },
});

export default Map;
