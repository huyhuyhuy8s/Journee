import { Request } from "express";
import { firestore } from "firebase-admin";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  roleId: ERole;
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
  lastLogin: firestore.Timestamp;
}

export enum ERole {
  ADMIN = "Nintendo7131",
  MODERATOR = "Destiny4015",
  USER = "Salon4637",
}

export enum ELocationSetting {
  PRECISE = "precise",
  BLURRED = "blurred",
  FROZEN = "frozen",
  HIDDEN = "hidden",
}

export type TActionSetting = {
  addFriend: boolean;
  commentPost: boolean;
};

export type TVisibilitySetting = {
  journalEntries: boolean;
  locationHistory: boolean;
  location: ELocationSetting;
};

export interface IUserSetting {
  userId: string;
  visibility: TVisibilitySetting;
  action: TActionSetting;
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
}

export interface IBlacklist {
  userId: string;
  blockedUsers: string[];
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
}

export interface IJournal {
  id: string;
  name: string;
  userId: string;
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
  entries?: IEntry[];
}

export interface IEntry {
  id: string;
  journalId: string;
  name: string;
  images?: string[];
  thought: string;
  location: ILocation;
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
}

export interface ILocation {
  place: string;
  street: string;
  city: string;
  region: string;
  country: string;
  value: string;
  coordinate: firestore.GeoPoint;
}

export interface IPost {
  id: string;
  userId: string;
  caption: string;
  images?: string[];
  journal?: IJournal[];
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
}

export interface IComment {
  id: string;
  userId: string;
  postId: string;
  context?: string;
  image?: string;
  createdAt: firestore.Timestamp;
}

export type TReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface IReaction {
  id: string;
  userId: string;
  postId: string;
  reactionType: TReactionType;
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
}

export type TMessageType =
  | string
  | ILocation
  | IJournal
  | IEntry
  | TReactionType;

export interface IMessage {
  id: string;
  senderId: string;
  receiverId: string;
  context: TMessageType;
  createdAt: firestore.Timestamp;
}

export interface IBlacklistToken {
  token: string;
  userId: string;
  blacklistedAt: firestore.Timestamp;
  expiresAt: firestore.Timestamp;
}

export interface UserPayload {
  id: string;
  role: ERole;
  avatar?: string;
  email?: string;
  name?: string;
  token?: string;
}

export interface AuthRequest extends Request {
  user?: UserPayload;
  token?: string;
}

export interface LocationData {
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
  speed?: number | null;
  movementState?: "STATIONARY" | "SLOW_MOVING" | "FAST_MOVING" | "UNKNOWN";
  enhancedPlace?: string;
  enhancedAddress?: string;
  geocodingSource?: string;
  geocodingConfidence?: string;
}

export interface VisitData {
  userId: string;
  externalId: string;
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
  arrivalTime: Date;
  departureTime?: Date | null;
  duration?: number | null;
  visitType: "confirmed" | "potential" | "brief";
  confidence: "high" | "medium" | "low";
  geocodingSource: string;
  metadata: {
    maxSpeed: number;
    minSpeed: number;
    averageSpeed: number;
    stationaryDuration: number;
    source: string;
    version: string;
  };
}

/// <reference types="express" />
export interface ApiResponse<T = any> {
  meta: {
    status: number;
    message: string;
    error: string;
  };
  results: T | null;
}
