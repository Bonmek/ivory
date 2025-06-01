// Time constants in milliseconds
export const ONE_DAY = 24 * 60 * 60 * 1000
export const ONE_WEEK = 7 * ONE_DAY
export const TWO_WEEKS = 2 * ONE_WEEK
export const ONE_MONTH = 30 * ONE_DAY
export const THREE_MONTHS = 3 * ONE_MONTH
export const SIX_MONTHS = 6 * ONE_MONTH
export const ONE_YEAR = 365 * ONE_DAY

// Buffer times for different scenarios
export const DEFAULT_EXPIRY_BUFFER = ONE_YEAR // 1 year
export const SHORT_EXPIRY_BUFFER = THREE_MONTHS // 3 months
export const MEDIUM_EXPIRY_BUFFER = SIX_MONTHS // 6 months
export const LONG_EXPIRY_BUFFER = ONE_YEAR // 1 year

// Time constants for UI display
export const EXPIRING_SOON_THRESHOLD = TWO_WEEKS // 2 weeks
export const RECENT_THRESHOLD = TWO_WEEKS // 2 weeks

// Set appropriate staleTime and cacheTime to reduce API calls
export const STALE_TIME = 5 * 60 * 1000 // 5 minutes - data considered fresh
export const CACHE_TIME = 10 * 60 * 1000 // 10 minutes - how long to keep in cache

// Retry configuration constants
export const MAX_RETRIES_RATE_LIMIT = 5 // Maximum retries for rate limiting errors
export const MAX_RETRIES_OTHER_ERRORS = 3 // Maximum retries for other errors
export const RETRY_BASE_DELAY_MS = 1000 // Base delay for exponential backoff (1 second)
export const MAX_RETRY_DELAY_MS = 10000 // Maximum retry delay (10 seconds)
