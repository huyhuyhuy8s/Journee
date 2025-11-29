import { useState, useCallback } from "react";
import * as Location from "expo-location";
import { LocationService } from "../services/locationService";
import type { MapRegion, Address } from "../utils/types";

export const useLocationTracking = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [region, setRegion] = useState<MapRegion>({
    latitude: 10.794847,
    longitude: 106.6426474,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [address, setAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateMapRegion = useCallback((location: Location.LocationObject) => {
    setRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, []);

  const getCurrentAddress = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const addressResult = await LocationService.reverseGeocode(
          latitude,
          longitude
        );
        setAddress(addressResult);
      } catch (error) {
        console.error("❌ Error getting address:", error);
      }
    },
    []
  );

  const getCurrentLocation =
    useCallback(async (): Promise<Location.LocationObject | null> => {
      try {
        setIsLoading(true);
        const locationResult = await LocationService.getCurrentLocation();

        if (locationResult) {
          setLocation(locationResult);
          updateMapRegion(locationResult);
          await getCurrentAddress(
            locationResult.coords.latitude,
            locationResult.coords.longitude
          );
        }

        return locationResult;
      } catch (error) {
        console.error("❌ Error getting location:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [updateMapRegion, getCurrentAddress]);

  return {
    location,
    region,
    address,
    isLoading,
    getCurrentLocation,
  };
};
