/**
 * Configuration constants for handlers
 */
export const HANDLER_CONSTANTS = {
  // Rate limiting defaults
  RATE_LIMIT: {
    DEFAULT_MAX_REQUESTS: 10,
    DEFAULT_WINDOW_MS: 60000, // 1 minute
    ADMIN_MAX_REQUESTS: 100,
    ADMIN_WINDOW_MS: 60000,
    COOLDOWN_MESSAGE: "⏳ Please slow down! You're making too many requests.",
  },
  
  // Error handling
  ERROR_HANDLING: {
    FEEDBACK_COOLDOWN_MS: 5000,
    FEEDBACK_TIMEOUT_MS: 3000,
    MAX_ERROR_RETRIES: 3,
  },
  
  // Performance monitoring
  PERFORMANCE: {
    SLOW_THRESHOLD_MS: 1000,
    CRITICAL_THRESHOLD_MS: 5000,
  },
  
  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    BASE_DELAY_MS: 1000,
    MAX_DELAY_MS: 10000,
  },
  
  // Update filtering
  FILTERS: {
    SKIP_BOT_USERS: true,
    SKIP_EDITED_MESSAGES: false,
    SKIP_CHANNEL_POSTS: false,
  },
  
  // Admin configuration
  ADMIN: {
    DEFAULT_ERROR_MESSAGE: "🚫 This command is only available for administrators.",
    SUPER_ADMIN_IDS: [], // Will be populated from env
  },
} as const;

/**
 * Get admin IDs from environment
 */
export function getAdminIds(): number[] {
  const adminIds = process.env.ADMIN_IDS?.split(',').map(Number).filter(id => !isNaN(id)) || [];
  console.log(`Loaded ${adminIds.length} admin IDs`);
  return adminIds;
}

/**
 * Check if user is admin
 */
export function isAdmin(userId?: number): boolean {
  if (!userId) return false;
  return getAdminIds().includes(userId);
}