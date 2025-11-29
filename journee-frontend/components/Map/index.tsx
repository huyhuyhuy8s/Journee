import React, { useEffect } from "react";
import SafeAreaVieww from "@/components/SafeAreaVieww";
import { useLocationPermissions } from "./hooks/useLocationPermissions";
import { useLocationTracking } from "./hooks/useLocationTracking";
import { useBackgroundTracking } from "./hooks/useBackgroundTracking";
import { useMovementState } from "./hooks/useMovementState";
import { MapViewComponent } from "./components/MapView";
import { TrackingButton } from "./components/TrackingButton";
import { MovementStateIndicator } from "./components/MovementStateIndicator";
import { LocationDisplay } from "./components/LocationDisplay";
import { AddressDisplay } from "./components/AddressDisplay";
import { ErrorMessage } from "./components/ErrorMessage";
import { VisitIndicator } from "./components/VisitIndicator";
import { BackendSyncIndicator } from "./components/BackendSyncIndicator";
import { BackendApiServices } from "@/services/backendApiServices";

const Map: React.FC = () => {
  const { isLocationPermitted, errorMsg, requestPermissions } =
    useLocationPermissions();
  const { location, region, address, getCurrentLocation } =
    useLocationTracking();
  const { isTracking, startTracking, stopTracking } = useBackgroundTracking();
  const { getMovementStateInfo } = useMovementState();

  useEffect(() => {
    const initializeLocationServices = async () => {
      if (!isLocationPermitted) {
        try {
          const permissionGranted = await requestPermissions();
          if (permissionGranted) {
            await getCurrentLocation();
          }
        } catch (error) {
          console.error("❌ Error initializing location services:", error);
        }
      }
    };

    initializeLocationServices();
  }, [isLocationPermitted, requestPermissions, getCurrentLocation]);

  // 🆕 Initialize backend connection and authentication
  useEffect(() => {
    const initializeBackend = async () => {
      try {
        // Test backend connection
        const isConnected = await BackendApiServices.testConnection();
        if (isConnected) {
          console.log("✅ Backend connection established");

          // TODO: Implement authentication
          // const userId = "your-user-id"; // Get from your auth system
          // await BackendApiService.authenticate(userId);
        } else {
          console.warn("⚠️ Backend connection failed");
        }
      } catch (error) {
        console.error("❌ Error initializing backend:", error);
      }
    };

    initializeBackend();
  }, []);

  const movementInfo = getMovementStateInfo();

  return (
    <SafeAreaVieww>
      <MapViewComponent region={region} />

      <TrackingButton
        isTracking={isTracking}
        onStart={startTracking}
        onStop={stopTracking}
      />

      {isTracking && <MovementStateIndicator movementInfo={movementInfo} />}

      <AddressDisplay address={address} />
      <LocationDisplay location={location} />
      <ErrorMessage errorMsg={errorMsg} />

      {/* Visit Detection Indicator */}
      <VisitIndicator isTracking={isTracking} />

      {/* 🆕 Backend Sync Indicator */}
      <BackendSyncIndicator isTracking={isTracking} />
    </SafeAreaVieww>
  );
};

export default Map;
