import { Middleware } from "grammy";
import { GrammyError, HttpError } from "grammy";
import { BotContext, RetryOptions } from "../types";
import { Logger } from "../utils/logger";

const logger = new Logger("RetryHandler");

export function createRetryHandler(options?: RetryOptions): Middleware<BotContext> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    retryOnCodes = [429, 500, 502, 503, 504],
    giveupMessage = "Sorry, the service is temporarily unavailable. Please try again later.",
    enabled = true,
  } = options || {};

  if (!enabled) {
    return async (_, next) => await next();
  }

  return async (ctx, next) => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await next();
      } catch (error) {
        lastError = error as Error;
        
        // Check if error is retryable
        const shouldRetry = isRetryableError(error, retryOnCodes);
        
        if (!shouldRetry || attempt === maxRetries) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = exponentialBackoff 
          ? retryDelay * Math.pow(2, attempt - 1)
          : retryDelay;
        
        logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
          userId: ctx.from?.id,
          error: error instanceof Error ? error.message : String(error),
          delay,
          attempt,
          maxRetries,
        });
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // All retries failed
    if (lastError) {
      logger.error(`All ${maxRetries} retry attempts failed`, {
        userId: ctx.from?.id,
        error: lastError.message,
        stack: lastError instanceof Error ? lastError.stack : undefined,
      });
      
      // Notify user if appropriate
      await notifyUserOfFailure(ctx, giveupMessage);
      
      throw lastError;
    }
  };
}

function isRetryableError(error: unknown, retryOnCodes: number[]): boolean {
  // Check for network errors
  if (error instanceof HttpError) {
    return true;
  }
  
  // Check for specific Telegram API error codes
  if (error instanceof GrammyError) {
    return retryOnCodes.includes(error.error_code);
  }
  
  // Check for timeout errors
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    return errorMessage.includes('timeout') || 
           errorMessage.includes('network') ||
           errorMessage.includes('connection');
  }
  
  return false;
}

async function notifyUserOfFailure(ctx: BotContext, message: string): Promise<void> {
  try {
    // Only notify in private chats or if it's a callback query
    if (ctx.chat?.type === 'private' && ctx.message) {
      await ctx.reply(message, { parse_mode: "HTML" });
    } else if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({
        text: "Service temporarily unavailable",
        show_alert: true,
      });
    }
  } catch (notificationError) {
    // Don't throw if we can't notify the user
    logger.warn("Failed to notify user of retry failure:", notificationError);
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    exponentialBackoff?: boolean;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries || 3;
  const retryDelay = options?.retryDelay || 1000;
  const exponentialBackoff = options?.exponentialBackoff ?? true;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = exponentialBackoff 
        ? retryDelay * Math.pow(2, attempt - 1)
        : retryDelay;
      
      logger.debug(`Retry attempt ${attempt} failed, waiting ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}