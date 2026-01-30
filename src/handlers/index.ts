/**
 * Central export file for all bot handlers
 */

// Error Handling
export { errorHandler } from './errorHandler';

// Middleware Handlers
export { createRateLimiter, cleanupRateLimitStore } from './rateLimiter';
export { createSessionValidator, resetUserSession, isSessionActive } from './sessionValidator';
export { createPerformanceMonitor, getPerformanceStats } from './performanceMonitor';
export { createUpdateFilter, didPassFilters } from './updateFilter';
export { createAdminOnly, checkIsAdmin, checkIsSuperAdmin, getAdminStats } from './adminOnly';
export { createRetryHandler, withRetry } from './retryHandler';
export { createRequestLogger, getRequestStats } from './requestLogger';
export { createMaintenanceMode, isMaintenanceMode, toggleMaintenanceMode, getMaintenanceInfo } from './maintenanceMode';

// Handler Management
export { setupHandlers, getHandlerStats, setMaintenanceMode, getHandlerConfig } from './handlerManager';

// Types
export type {
  HandlerOptions,
  RateLimitOptions,
  PerformanceOptions,
  UpdateFilterOptions,
  AdminOnlyOptions,
  RetryOptions,
  LoggingOptions,
  MaintenanceOptions,
  SessionValidationOptions,
} from '../types';

// Constants
import { HANDLER_CONSTANTS } from '../config/constants';
export { HANDLER_CONSTANTS };