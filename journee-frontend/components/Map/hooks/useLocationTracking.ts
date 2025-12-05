// components/Map/hooks/useLocationTracking.ts
import { useState, useCallback, useRef } from "react";
import * as Location from "expo-location";
import { LocationService } from "../services/locationService";
// 🆕 Import shared types
import type { Address, MapRegion } from "../utils/types";

export const useLocationTracking = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [region, setRegion] = useState<MapRegion | null>(null);
  const [address, setAddress] = useState<Address>({});

  const lastLocationRef = useRef<Location.LocationObject | null>(null);

  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number): Promise<void> => {
      try {
        console.log(
          `🔍 Starting geocoding request for: ${latitude.toFixed(
            6
          )}, ${longitude.toFixed(6)}`
        );

        // Use your LocationService for geocoding
        const addressResult = await LocationService.reverseGeocode(
          latitude,
          longitude
        );

        if (addressResult) {
          // 🆕 Log the value properly
          console.log(
            `✅ Address found: ${
              addressResult.value ||
              addressResult.formattedAddress ||
              "No address text"
            }`
          );

          // 🆕 Set the address object with all properties
          setAddress({
            street: addressResult.street,
            city: addressResult.city,
            region: addressResult.region,
            country: addressResult.country,
            postalCode: addressResult.postalCode,
            formattedAddress: addressResult.formattedAddress,
            place: addressResult.place,
            confidence: addressResult.confidence,
            source: addressResult.source,
            value: addressResult.value,
          });
        } else {
          console.log("❌ No address found for coordinates");
          setAddress({
            formattedAddress: "Address not found",
          });
        }
      } catch (error) {
        console.error("❌ Error in reverse geocoding:", error);
        setAddress({
          formattedAddress: "Error getting address",
        });
      }
    },
    []
  );

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    try {
      const newLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Only update if location actually changed significantly (10 meters)
      if (
        !lastLocationRef.current ||
        Math.abs(
          lastLocationRef.current.coords.latitude - newLocation.coords.latitude
        ) > 0.0001 ||
        Math.abs(
          lastLocationRef.current.coords.longitude -
            newLocation.coords.longitude
        ) > 0.0001
      ) {
        console.log("📍 Location changed significantly, updating...");

        setLocation(newLocation);
        lastLocationRef.current = newLocation;

        // Update region only when location changes significantly
        setRegion({
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // Trigger reverse geocoding
        await reverseGeocode(
          newLocation.coords.latitude,
          newLocation.coords.longitude
        );
      } else {
        console.log("📍 Location change too small, skipping update");
      }
    } catch (error) {
      console.error("❌ Error getting current location:", error);
    }
  }, [reverseGeocode]);

  return {
    location,
    region,
    address,
    getCurrentLocation,
  };
};
