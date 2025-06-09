export interface PollingConfig {
  maxAttempts: number
  pollInterval: number
  timeout: number
}

/**
 * Standard polling configuration for all state updates
 * - maxAttempts: Maximum number of retry attempts
 * - pollInterval: Time between each poll in milliseconds
 * - timeout: Maximum total time to wait in milliseconds
 * 
 * Note: These values can be adjusted based on network conditions and requirements
 */
export const POLLING_CONFIG: PollingConfig = {
  maxAttempts: 5,
  pollInterval: 2000, // 2 seconds
  timeout: 15000, // 15 seconds
} 