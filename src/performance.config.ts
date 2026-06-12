// Performance profile: speed
// Optimized for speed — may use more memory/connections.

export const PERFORMANCE_CONFIG = {
  maxConnections: 10,
  maxStorageGb: 5,
  maxBandwidthGb: 10,
  computeTier: 'free',
  scalingStrategy: 'vertical',
  profile: 'speed',
}

// To use: import { PERFORMANCE_CONFIG } from "@/performance.config";
