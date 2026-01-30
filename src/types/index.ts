import { Context, SessionFlavor } from "grammy";

/**
 * 1. Configuration Interface
 * Centralized settings for the bot and the external app.
 */
export interface Config {
  botToken: string;
  botUsername: string;
  environment: "development" | "production" | "test";
  port: number;
  webAppUrl: string; // URL of your external HTTPS application
  webhookUrl?: string; // Required for production
  webhookSecret: string; // For securing the webhook endpoint
  logLevel: "debug" | "info" | "warn" | "error";
  isProduction: boolean;

  // Handler configurations
  handlers: {
    enableRateLimiting: boolean;
    enablePerformanceMonitoring: boolean;
    enableRequestLogging: boolean;
    maintenanceMode: boolean;
    adminIds: number[];
    trustedChats?: number[]; // Chats where filters don't apply
  };
}

/**
 * 2. Session Data
 * Persisted user state. Crucial for tracking user flow before
 * they enter the external application.
 */
export interface SessionData {
  /** The referral or deep-link parameter used to join */
  referralCode?: string;
  /** Last time the user interacted with the bot */
  lastInteraction: number;
  /** Track user onboarding steps */
  step: "idle" | "awaiting_onboarding" | "active";
  /** Additional handler-specific session data */
  handlerData?: {
    requestCount?: number;
    lastRequestTime?: number;
    errorCount?: number;
    isRateLimited?: boolean;
  };
}

/**
 * 3. WebApp User Data
 * This mirrors the structure Telegram sends to your external HTTPS app.
 * Useful for validating 'initData' on your backend.
 */
export interface WebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

/**
 * 4. Bot Context (The "Flavor")
 * Merges standard grammY context with sessions and custom properties.
 */
export type BotContext = Context &
  SessionFlavor<SessionData> & {
    /** Custom shortcut to access config within any handler via ctx.config */
    config: Config;

    /** Handler-specific properties */
    isAdmin?: boolean;
    requestStartTime?: number;
    skipHandlers?: string[]; // Array of handler names to skip
    handlerMetadata?: Record<string, any>; // Metadata for handlers

    /** Optional: Add a property for a database instance if you use one
     * db: DatabaseConnection;
     */
  };

/**
 * 5. API Response Wrapper (Optional but recommended)
 * Standardizing how your bot/backend communicates with the HTTPS app.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

// ============================================================================
// Handler-specific types
// ============================================================================

/**
 * Base options for all handlers
 */
export interface HandlerOptions {
  enabled?: boolean;
  logLevel?: "debug" | "info" | "warn" | "error";
  skipForAdmins?: boolean;
  skipForTrusted?: boolean;
}

/**
 * Rate limiting options
 */
export interface RateLimitOptions extends HandlerOptions {
  maxRequests?: number;
  timeWindow?: number; // in milliseconds
  cooldownMessage?: string;
  excludeAdmins?: boolean;
  excludeTrustedChats?: boolean;
  cleanupInterval?: number;
}

/**
 * Performance monitoring options
 */
export interface PerformanceOptions extends HandlerOptions {
  thresholdMs?: number;
  logSlowRequests?: boolean;
  logAllRequests?: boolean;
  trackMemoryUsage?: boolean;
  trackGarbageCollection?: boolean;
}

/**
 * Update filtering options
 */
export interface UpdateFilterOptions extends HandlerOptions {
  skipBotUsers?: boolean;
  skipEditedMessages?: boolean;
  skipChannelPosts?: boolean;
  skipOldUpdates?: boolean;
  maxUpdateAge?: number; // in seconds
  allowedChatTypes?: Array<"private" | "group" | "supergroup" | "channel">;
}

/**
 * Admin-only middleware options
 */
export interface AdminOnlyOptions extends HandlerOptions {
  errorMessage?: string;
  allowInPrivateChats?: boolean;
  requireSuperAdmin?: boolean;
  superAdminIds?: number[];
}

/**
 * Retry handler options
 */
export interface RetryOptions extends HandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  retryOnCodes?: number[]; // HTTP/TG error codes to retry
  giveupMessage?: string;
}

/**
 * Request logging options
 */
export interface LoggingOptions extends HandlerOptions {
  includeHeaders?: boolean;
  includeBody?: boolean;
  includeResponse?: boolean;
  logFullUpdate?: boolean;
  excludeSensitive?: boolean;
  sensitiveFields?: string[];
}

/**
 * Maintenance mode options
 */
export interface MaintenanceOptions extends HandlerOptions {
  message?: string;
  allowedEndpoints?: string[]; // Endpoints that still work during maintenance
  scheduledMaintenance?: {
    start: Date;
    end: Date;
    timezone?: string;
  };
}

/**
 * Session validation options
 */
export interface SessionValidationOptions extends HandlerOptions {
  autoInitialize?: boolean;
  validateOnStart?: boolean;
  sessionTimeout?: number; // in milliseconds
  cleanupOldSessions?: boolean;
}

/**
 * Error context for structured logging
 */
export interface ErrorContext {
  updateId: number;
  userId?: number;
  username: string;
  chatType: string;
  updateType: string;
  chatId?: number;
  messageId?: number;
  callbackData?: string;
  timestamp: string;
  sessionStep?: string;
  handlerChain?: string[];
}

/**
 * Handler statistics for monitoring
 */
export interface HandlerStats {
  name: string;
  totalRequests: number;
  blockedRequests: number;
  averageProcessingTime: number;
  lastUpdated: Date;
}

/**
 * Global state for handlers (in-memory store)
 */
export interface HandlerGlobalState {
  errorCooldown: Map<string, number>;
  rateLimits: Map<string, number[]>;
  performanceMetrics: Array<{
    timestamp: number;
    duration: number;
    handler: string;
  }>;
  requestCounts: Map<string, number>;
}

declare global {
  var handlerState: HandlerGlobalState | undefined;
}
