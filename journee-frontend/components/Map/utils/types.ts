import * as Location from "expo-location";
import { Region } from "react-native-maps";

export interface MovementAnalysis {
  currentSpeed: number;
  distanceTraveled: number;
  timeDelta: number;
}

export interface LocationData extends Location.LocationObject {
  movementState: string;
  speed: number;
  averageSpeed: number;
  timeSinceStateChange: number;
}

export interface Address {
  place: string;
  value: string;
  confidence?: "high" | "medium" | "low";
  source?: "expo" | "openmaps" | "combined" | "fallback";
}

export interface UIUpdateData {
  movementState: string;
  currentSpeed: number;
  averageSpeed: number;
  timeSinceStateChange: number;
  timestamp: number;
}

export interface MapRegion extends Region {}
