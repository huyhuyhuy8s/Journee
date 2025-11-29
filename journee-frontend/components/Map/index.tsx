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
import { VisitIndicator } from "./components/VisitIndicator"; // 🆕 Added

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

      {/* 🆕 Visit Detection Indicator */}
      <VisitIndicator isTracking={isTracking} />
    </SafeAreaVieww>
  );
};

export default Map;
