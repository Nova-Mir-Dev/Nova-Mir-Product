// Performance profile: security
// Conservative defaults — prioritize safety over raw speed.

export const PERFORMANCE_CONFIG = {
  maxConnections: 25,
  maxStorageGb: 50,
  maxBandwidthGb: 50,
  computeTier: "starter",
  scalingStrategy: "vertical",
  profile: "security",
};

// To use: import { PERFORMANCE_CONFIG } from "@/performance.config";
