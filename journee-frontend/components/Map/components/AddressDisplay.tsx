// components/Map/components/AddressDisplay.tsx
import React from "react";
import { Text } from "react-native";
import type { Address } from "../utils/types";

interface AddressDisplayProps {
  address: Address | null;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({ address }) => {
  if (!address) return null;

  const getConfidenceColor = (confidence?: string) => {
    switch (confidence) {
      case "high":
        return "#4CAF50";
      case "medium":
        return "#FF9800";
      case "low":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getConfidenceIcon = (confidence?: string) => {
    switch (confidence) {
      case "high":
        return "🎯";
      case "medium":
        return "📍";
      case "low":
        return "📌";
      default:
        return "📍";
    }
  };

  return (
    <Text
      style={{
        position: "absolute",
        top: 50,
        left: 10,
        maxWidth: "50%",
        backgroundColor: "rgba(255,255,255,0.9)",
        padding: 10,
        borderRadius: 8,
        fontSize: 11,
        lineHeight: 16,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
      }}
    >
      <Text style={{ fontWeight: "600", color: "#333" }}>
        {getConfidenceIcon(address.confidence)} {address.place}
      </Text>
      {"\n"}
      <Text style={{ color: "#666", fontSize: 10 }}>{address.value}</Text>
      {"\n"}
      <Text
        style={{
          color: getConfidenceColor(address.confidence),
          fontSize: 9,
          fontWeight: "500",
        }}
      >
        {address.source?.toUpperCase()} • {address.confidence?.toUpperCase()}
      </Text>
    </Text>
  );
};
