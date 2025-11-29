import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BACKGROUND_LOCATION_TASK,
  MOVEMENT_STATES,
  STATE_STABILITY_CONFIG,
} from "../utils/constants";
import { calculateDistance, getIntervalText } from "../utils/locationUtils";
import {
  determineMovementState,
  getNotificationColor,
  getActivityType,
} from "../utils/movementStateUtils";
import { validateStateChange } from "../utils/validators";
import { StorageService } from "./storageService";
import { VisitDetectionService } from "../../../services/visitDetectionService";
import { GlobalGeocodingService } from "../../../services/geocodingService";
import type { MovementAnalysis, LocationData } from "../utils/types";

interface StateSpecificData {
  lastLocationCheck: number;
  speedSamples: number[];
  locationSamples: {
    lat: number;
    lng: number;
    timestamp: number;
    speed: number;
  }[];
  continuousMonitoringStart?: number;
  currentPhase: "waiting" | "monitoring" | "finalizing";
}

export class BackgroundTaskService {
  private static readonly BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  // State-specific distance thresholds
  private static readonly SLOW_MOVING_FAR_THRESHOLD = 4000; // 4km
  private static readonly STATIONARY_NEAR_THRESHOLD = 1000; // 1km
  private static readonly STATIONARY_FAR_THRESHOLD = 4000; // 4km

  // Monitoring durations
  private static readonly SPEED_MONITORING_DURATION = 60 * 1000; // 1 minute
  private static readonly SLOW_MOVING_INTERVAL = 30 * 60 * 1000; // 30 minutes
  private static readonly STATIONARY_INTERVAL = 60 * 60 * 1000; // 1 hour

  static async analyzeMovement(
    currentLocation: Location.LocationObject,
    previousLocation: Location.LocationObject | null
  ): Promise<MovementAnalysis> {
    let currentSpeed = 0;
    let distanceTraveled = 0;
    let timeDelta = 0;

    if (previousLocation) {
      timeDelta =
        (currentLocation.timestamp - previousLocation.timestamp) / 1000;
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
  }

  static async handleBackgroundLocation(
    location: Location.LocationObject
  ): Promise<void> {
    try {
      console.log("🔄 Processing background location...");

      const [
        lastLocationStr,
        lastMovementState,
        stateChangeTimeStr,
        stabilityBufferStr,
        stateDataStr,
      ] = await Promise.all([
        StorageService.getStorageValue("LAST_LOCATION"),
        StorageService.getStorageValue("MOVEMENT_STATE"),
        StorageService.getStorageValue("STATE_CHANGE_TIME"),
        StorageService.getStorageValue("STATE_STABILITY_BUFFER"),
        AsyncStorage.getItem("stateSpecificData"),
      ]);

      let previousLocation: Location.LocationObject | null = null;
      if (lastLocationStr) {
        previousLocation = JSON.parse(lastLocationStr);
      }

      const currentState = lastMovementState || "FAST_MOVING";
      let stateChangeTime = stateChangeTimeStr
        ? parseInt(stateChangeTimeStr)
        : Date.now();
      let speedBuffer: number[] = stabilityBufferStr
        ? JSON.parse(stabilityBufferStr)
        : [];
      let stateData: StateSpecificData = stateDataStr
        ? JSON.parse(stateDataStr)
        : {
            lastLocationCheck: Date.now(),
            speedSamples: [],
            locationSamples: [],
            currentPhase: "waiting",
          };

      const movementAnalysis = await this.analyzeMovement(
        location,
        previousLocation
      );

      // Handle state-specific logic
      const stateTransitionResult = await this.handleStateSpecificLogic(
        location,
        movementAnalysis,
        currentState,
        previousLocation,
        stateData
      );

      let finalState = stateTransitionResult.newState;
      let shouldUpdateStateChangeTime = stateTransitionResult.stateChanged;
      stateData = stateTransitionResult.updatedStateData;

      // Update state change time if state changed
      if (shouldUpdateStateChangeTime) {
        stateChangeTime = Date.now();
        console.log(`✅ State transition: ${currentState} → ${finalState}`);
      }

      // Update speed buffer for general tracking
      speedBuffer.push(movementAnalysis.currentSpeed);
      if (speedBuffer.length > STATE_STABILITY_CONFIG.SAMPLE_BUFFER_SIZE) {
        speedBuffer = speedBuffer.slice(
          -STATE_STABILITY_CONFIG.SAMPLE_BUFFER_SIZE
        );
      }

      const averageSpeed =
        speedBuffer.reduce((sum, speed) => sum + speed, 0) / speedBuffer.length;
      const timeSinceLastChange = Date.now() - stateChangeTime;

      // Process location for visit detection (for all states)
      try {
        const detectedVisit =
          await VisitDetectionService.processLocationForVisit(
            location.coords.latitude,
            location.coords.longitude,
            movementAnalysis.currentSpeed,
            finalState,
            location.timestamp
          );

        if (detectedVisit) {
          console.log(
            `🏪 Visit detected: ${detectedVisit.place} (${detectedVisit.visitType})`
          );
          await this.sendVisitToBackend(detectedVisit);
        }
      } catch (visitError) {
        console.error("❌ Error in visit detection:", visitError);
      }

      // Save all data
      await Promise.all([
        StorageService.setStorageValue(
          "LAST_LOCATION",
          JSON.stringify(location)
        ),
        StorageService.setStorageValue("MOVEMENT_STATE", finalState),
        StorageService.setStorageValue(
          "STATE_CHANGE_TIME",
          stateChangeTime.toString()
        ),
        StorageService.setStorageValue(
          "STATE_STABILITY_BUFFER",
          JSON.stringify(speedBuffer)
        ),
        StorageService.setStorageValue("LAST_SPEED", averageSpeed.toString()),
        AsyncStorage.setItem("stateSpecificData", JSON.stringify(stateData)),
      ]);

      // Update UI data
      await StorageService.updateUIData({
        movementState: finalState,
        currentSpeed: movementAnalysis.currentSpeed,
        averageSpeed,
        timeSinceStateChange: timeSinceLastChange,
        timestamp: Date.now(),
      });

      // Restart tracking with correct interval based on final state
      const newState =
        Object.values(MOVEMENT_STATES).find((s) => s.name === finalState) ||
        MOVEMENT_STATES.FAST_MOVING;
      await this.restartBackgroundTrackingWithNewInterval(newState);

      // Store location data
      const locationData: LocationData = {
        ...location,
        movementState: finalState,
        speed: movementAnalysis.currentSpeed,
        averageSpeed,
        timeSinceStateChange: timeSinceLastChange,
      };
      await StorageService.storeLocationData(locationData);
    } catch (error) {
      console.error("❌ Error handling background location:", error);
    }
  }

  /**
   * Handle state-specific logic for SLOW_MOVING and STATIONARY
   */
  private static async handleStateSpecificLogic(
    location: Location.LocationObject,
    movementAnalysis: MovementAnalysis,
    currentState: string,
    previousLocation: Location.LocationObject | null,
    stateData: StateSpecificData
  ): Promise<{
    newState: string;
    stateChanged: boolean;
    updatedStateData: StateSpecificData;
  }> {
    const now = Date.now();

    switch (currentState) {
      case "SLOW_MOVING":
        return await this.handleSlowMovingLogic(
          location,
          movementAnalysis,
          previousLocation,
          stateData,
          now
        );

      case "STATIONARY":
        return await this.handleStationaryLogic(
          location,
          movementAnalysis,
          previousLocation,
          stateData,
          now
        );

      default: // FAST_MOVING
        return await this.handleFastMovingLogic(
          location,
          movementAnalysis,
          previousLocation,
          stateData,
          now
        );
    }
  }

  /**
   * Handle SLOW_MOVING state logic
   */
  private static async handleSlowMovingLogic(
    location: Location.LocationObject,
    movementAnalysis: MovementAnalysis,
    previousLocation: Location.LocationObject | null,
    stateData: StateSpecificData,
    now: number
  ): Promise<{
    newState: string;
    stateChanged: boolean;
    updatedStateData: StateSpecificData;
  }> {
    const timeSinceLastCheck = now - stateData.lastLocationCheck;

    // Check if it's time for a 30-minute check or we're in monitoring phase
    if (
      stateData.currentPhase === "waiting" &&
      timeSinceLastCheck < this.SLOW_MOVING_INTERVAL
    ) {
      // Still waiting for the 30-minute interval
      return {
        newState: "SLOW_MOVING",
        stateChanged: false,
        updatedStateData: stateData,
      };
    }

    if (stateData.currentPhase === "waiting") {
      // Start the location check
      console.log("🚶 SLOW_MOVING: Starting 30-minute location check");

      if (previousLocation) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          previousLocation.coords.latitude,
          previousLocation.coords.longitude
        );

        console.log(
          `📏 SLOW_MOVING distance check: ${distance.toFixed(
            0
          )}m from last location`
        );

        if (distance >= this.SLOW_MOVING_FAR_THRESHOLD) {
          // User moved far away, switch to FAST_MOVING
          console.log(
            `🏃 SLOW_MOVING → FAST_MOVING: Moved ${distance.toFixed(0)}m (>${
              this.SLOW_MOVING_FAR_THRESHOLD
            }m)`
          );

          return {
            newState: "FAST_MOVING",
            stateChanged: true,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        }
      }

      // Start 1-minute monitoring phase
      stateData.currentPhase = "monitoring";
      stateData.continuousMonitoringStart = now;
      stateData.speedSamples = [movementAnalysis.currentSpeed];
      stateData.locationSamples = [
        {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          timestamp: now,
          speed: movementAnalysis.currentSpeed,
        },
      ];

      console.log("⏱️ SLOW_MOVING: Starting 1-minute speed monitoring");
    }

    if (stateData.currentPhase === "monitoring") {
      // Continue monitoring for 1 minute
      const monitoringDuration =
        now - (stateData.continuousMonitoringStart || now);

      stateData.speedSamples.push(movementAnalysis.currentSpeed);
      stateData.locationSamples.push({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        timestamp: now,
        speed: movementAnalysis.currentSpeed,
      });

      if (monitoringDuration >= this.SPEED_MONITORING_DURATION) {
        // Monitoring period complete, analyze results
        const averageSpeed =
          stateData.speedSamples.reduce((sum, speed) => sum + speed, 0) /
          stateData.speedSamples.length;

        console.log(
          `📊 SLOW_MOVING monitoring complete: avg speed ${averageSpeed.toFixed(
            2
          )} km/h over ${monitoringDuration / 1000}s`
        );

        if (averageSpeed < 1.0) {
          // Switch to STATIONARY
          console.log("📍 SLOW_MOVING → STATIONARY: Average speed < 1 km/h");

          // Get enhanced location data before switching
          await this.processFinalLocationUpdate(location);

          return {
            newState: "STATIONARY",
            stateChanged: true,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        } else {
          // Stay in SLOW_MOVING, process final location and wait for next cycle
          console.log("🚶 SLOW_MOVING: Staying in slow moving state");

          await this.processFinalLocationUpdate(location);

          return {
            newState: "SLOW_MOVING",
            stateChanged: false,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        }
      }
    }

    return {
      newState: "SLOW_MOVING",
      stateChanged: false,
      updatedStateData: stateData,
    };
  }

  /**
   * Handle STATIONARY state logic
   */
  private static async handleStationaryLogic(
    location: Location.LocationObject,
    movementAnalysis: MovementAnalysis,
    previousLocation: Location.LocationObject | null,
    stateData: StateSpecificData,
    now: number
  ): Promise<{
    newState: string;
    stateChanged: boolean;
    updatedStateData: StateSpecificData;
  }> {
    const timeSinceLastCheck = now - stateData.lastLocationCheck;

    // Check if it's time for an hourly check or we're in monitoring phase
    if (
      stateData.currentPhase === "waiting" &&
      timeSinceLastCheck < this.STATIONARY_INTERVAL
    ) {
      // Still waiting for the hourly interval
      return {
        newState: "STATIONARY",
        stateChanged: false,
        updatedStateData: stateData,
      };
    }

    if (stateData.currentPhase === "waiting") {
      // Start the hourly location check
      console.log("📍 STATIONARY: Starting hourly location check");

      if (previousLocation) {
        const distance = calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          previousLocation.coords.latitude,
          previousLocation.coords.longitude
        );

        console.log(
          `📏 STATIONARY distance check: ${distance.toFixed(
            0
          )}m from last location`
        );

        if (distance >= this.STATIONARY_FAR_THRESHOLD) {
          // User moved very far away, switch to FAST_MOVING
          console.log(
            `🏃 STATIONARY → FAST_MOVING: Moved ${distance.toFixed(0)}m (>${
              this.STATIONARY_FAR_THRESHOLD
            }m)`
          );

          return {
            newState: "FAST_MOVING",
            stateChanged: true,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        }

        if (distance >= this.STATIONARY_NEAR_THRESHOLD) {
          // User moved significantly, start monitoring
          console.log(
            `⏱️ STATIONARY: User moved ${distance.toFixed(
              0
            )}m, starting 1-minute monitoring`
          );

          stateData.currentPhase = "monitoring";
          stateData.continuousMonitoringStart = now;
          stateData.speedSamples = [movementAnalysis.currentSpeed];
          stateData.locationSamples = [
            {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              timestamp: now,
              speed: movementAnalysis.currentSpeed,
            },
          ];
        } else {
          // User hasn't moved much, process final location and continue waiting
          console.log(
            "📍 STATIONARY: No significant movement, continuing stationary state"
          );

          await this.processFinalLocationUpdate(location);

          return {
            newState: "STATIONARY",
            stateChanged: false,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        }
      }
    }

    if (stateData.currentPhase === "monitoring") {
      // Continue monitoring for 1 minute
      const monitoringDuration =
        now - (stateData.continuousMonitoringStart || now);

      stateData.speedSamples.push(movementAnalysis.currentSpeed);
      stateData.locationSamples.push({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        timestamp: now,
        speed: movementAnalysis.currentSpeed,
      });

      if (monitoringDuration >= this.SPEED_MONITORING_DURATION) {
        // Monitoring period complete, analyze results
        const averageSpeed =
          stateData.speedSamples.reduce((sum, speed) => sum + speed, 0) /
          stateData.speedSamples.length;

        console.log(
          `📊 STATIONARY monitoring complete: avg speed ${averageSpeed.toFixed(
            2
          )} km/h over ${monitoringDuration / 1000}s`
        );

        if (averageSpeed >= 5.0) {
          // Switch to FAST_MOVING
          console.log("🏃 STATIONARY → FAST_MOVING: Average speed ≥ 5 km/h");

          return {
            newState: "FAST_MOVING",
            stateChanged: true,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        } else if (averageSpeed >= 1.0) {
          // Switch to SLOW_MOVING
          console.log("🚶 STATIONARY → SLOW_MOVING: Average speed ≥ 1 km/h");

          return {
            newState: "SLOW_MOVING",
            stateChanged: true,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        } else {
          // Stay STATIONARY
          console.log("📍 STATIONARY: Staying stationary (avg speed < 1 km/h)");

          await this.processFinalLocationUpdate(location);

          return {
            newState: "STATIONARY",
            stateChanged: false,
            updatedStateData: {
              lastLocationCheck: now,
              speedSamples: [],
              locationSamples: [],
              currentPhase: "waiting",
            },
          };
        }
      }
    }

    return {
      newState: "STATIONARY",
      stateChanged: false,
      updatedStateData: stateData,
    };
  }

  /**
   * Handle FAST_MOVING state logic (existing logic)
   */
  private static async handleFastMovingLogic(
    location: Location.LocationObject,
    movementAnalysis: MovementAnalysis,
    previousLocation: Location.LocationObject | null,
    stateData: StateSpecificData,
    now: number
  ): Promise<{
    newState: string;
    stateChanged: boolean;
    updatedStateData: StateSpecificData;
  }> {
    // Use existing fast moving logic with speed buffer validation
    const speedBuffer = stateData.speedSamples.slice(-10); // Use last 10 samples
    speedBuffer.push(movementAnalysis.currentSpeed);

    if (speedBuffer.length > 10) {
      speedBuffer.splice(0, speedBuffer.length - 10);
    }

    const averageSpeed =
      speedBuffer.reduce((sum, speed) => sum + speed, 0) / speedBuffer.length;
    const potentialNewState = determineMovementState(averageSpeed);

    if (potentialNewState.name !== "FAST_MOVING") {
      const isValidChange = await validateStateChange(
        "FAST_MOVING",
        potentialNewState.name,
        speedBuffer,
        averageSpeed
      );

      if (isValidChange) {
        console.log(
          `🔄 FAST_MOVING → ${potentialNewState.name}: Validated state change`
        );

        return {
          newState: potentialNewState.name,
          stateChanged: true,
          updatedStateData: {
            lastLocationCheck: now,
            speedSamples: speedBuffer,
            locationSamples: [],
            currentPhase: "waiting",
          },
        };
      }
    }

    return {
      newState: "FAST_MOVING",
      stateChanged: false,
      updatedStateData: {
        ...stateData,
        speedSamples: speedBuffer,
      },
    };
  }

  /**
   * Process final location update using enhanced geocoding
   */
  private static async processFinalLocationUpdate(
    location: Location.LocationObject
  ): Promise<void> {
    try {
      console.log(
        "🎯 Processing final location update with enhanced geocoding"
      );

      const geocodingResult =
        await GlobalGeocodingService.getBestGeocodingResult(
          location.coords.latitude,
          location.coords.longitude
        );

      if (geocodingResult) {
        console.log(
          `✅ Enhanced location result: ${geocodingResult.place} (${geocodingResult.source})`
        );

        // Store enhanced location data
        const enhancedLocationData = {
          ...location,
          enhancedPlace: geocodingResult.place,
          enhancedAddress: geocodingResult.value,
          geocodingSource: geocodingResult.source,
          geocodingConfidence: geocodingResult.confidence,
          timestamp: Date.now(),
        };

        await AsyncStorage.setItem(
          "lastEnhancedLocation",
          JSON.stringify(enhancedLocationData)
        );

        // Send to backend if available
        if (this.BACKEND_URL) {
          await this.sendLocationUpdateToBackend(enhancedLocationData);
        }
      }
    } catch (error) {
      console.error("❌ Error processing final location update:", error);
    }
  }

  /**
   * Send location update to backend
   */
  static async sendLocationUpdateToBackend(locationData: any): Promise<void> {
    try {
      if (!this.BACKEND_URL) {
        console.warn("⚠️ Backend URL not configured");
        return;
      }

      const response = await fetch(`${this.BACKEND_URL}/api/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
        },
        body: JSON.stringify({
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          enhancedPlace: locationData.enhancedPlace,
          enhancedAddress: locationData.enhancedAddress,
          geocodingSource: locationData.geocodingSource,
          geocodingConfidence: locationData.geocodingConfidence,
          timestamp: locationData.timestamp,
          accuracy: locationData.coords.accuracy,
          speed: locationData.coords.speed,
        }),
      });

      if (response.ok) {
        console.log("✅ Location update sent to backend");
      } else {
        console.error(
          `❌ Failed to send location update to backend: ${response.status}`
        );
      }
    } catch (error) {
      console.error("❌ Error sending location update to backend:", error);
    }
  }

  /**
   * Send visit to backend
   */
  static async sendVisitToBackend(visit: any): Promise<void> {
    try {
      if (!this.BACKEND_URL) {
        console.warn("⚠️ Backend URL not configured");
        return;
      }

      const response = await fetch(`${this.BACKEND_URL}/api/visits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
        },
        body: JSON.stringify({
          id: visit.id,
          place: visit.place,
          address: visit.address,
          latitude: visit.latitude,
          longitude: visit.longitude,
          arrivalTime: visit.arrivalTime,
          departureTime: visit.departureTime,
          duration: visit.duration,
          confidence: visit.confidence,
          source: visit.source,
          visitType: visit.visitType,
          metadata: visit.metadata,
        }),
      });

      if (response.ok) {
        console.log(`✅ Visit sent to backend: ${visit.place}`);
      } else {
        console.error(`❌ Failed to send visit to backend: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error sending visit to backend:", error);
    }
  }

  // ... rest of existing methods (startBackgroundTracking, stopBackgroundTracking, etc.) remain the same

  static async startBackgroundTracking(): Promise<boolean> {
    try {
      console.log("🌙 Starting background tracking...");

      const isTaskDefined = TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);
      if (!isTaskDefined) {
        console.error("❌ Task not defined");
        return false;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      );
      if (hasStarted) {
        console.log("⚠️ Already started");
        return true;
      }

      const backgroundStatus = await Location.getBackgroundPermissionsAsync();
      if (backgroundStatus.status !== Location.PermissionStatus.GRANTED) {
        console.error("❌ Background permission required");
        return false;
      }

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

      await AsyncStorage.setItem(
        "currentTrackingConfig",
        JSON.stringify({
          name: initialState.name,
          updateInterval: initialState.updateInterval,
          distanceInterval: initialState.distanceInterval,
        })
      );

      // Initialize state-specific data
      const initialStateData: StateSpecificData = {
        lastLocationCheck: Date.now(),
        speedSamples: [],
        locationSamples: [],
        currentPhase: "waiting",
      };
      await AsyncStorage.setItem(
        "stateSpecificData",
        JSON.stringify(initialStateData)
      );

      console.log(`✅ Background tracking started with ${initialState.name}`);
      return true;
    } catch (error) {
      console.error("❌ Error starting tracking:", error);
      return false;
    }
  }

  static async stopBackgroundTracking(): Promise<void> {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }
      await StorageService.clearTrackingData();
      await AsyncStorage.removeItem("stateSpecificData");
      console.log("✅ Background tracking stopped");
    } catch (error) {
      console.error("❌ Error stopping tracking:", error);
    }
  }

  static async restartBackgroundTrackingWithNewInterval(
    newState: any
  ): Promise<void> {
    try {
      const currentConfig = await AsyncStorage.getItem("currentTrackingConfig");
      const newConfigStr = JSON.stringify({
        name: newState.name,
        updateInterval: newState.updateInterval,
        distanceInterval: newState.distanceInterval,
      });

      if (currentConfig === newConfigStr) {
        console.log(
          `⚡ Already using ${newState.name} configuration - no restart needed`
        );
        return;
      }

      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        BACKGROUND_LOCATION_TASK
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      }

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

      await AsyncStorage.setItem("currentTrackingConfig", newConfigStr);
      console.log(`✅ Tracking restarted with ${newState.name}`);
    } catch (error) {
      console.error("❌ Error restarting tracking:", error);
    }
  }
}

// Initialize TaskManager
TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }: { data: any; error: any }) => {
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
        await BackgroundTaskService.handleBackgroundLocation(locations[0]);
      }
    }
  }
);
