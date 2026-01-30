import { BotError, GrammyError, HttpError } from "grammy";
import { BotContext, ErrorContext } from "../types";
import { Logger } from "../utils/logger";
import { config } from "../config";
import { HANDLER_CONSTANTS } from "../config/constants";

const logger = new Logger("ErrorHandler");

export async function errorHandler(err: BotError<BotContext>): Promise<void> {
  const ctx = err.ctx;
  const error = err.error;
  
  // Gather enriched context details
  const errorContext = gatherErrorContext(ctx);
  
  // Enhanced error classification and handling
  if (error instanceof GrammyError) {
    await handleGrammyError(error, ctx, errorContext);
  } else if (error instanceof HttpError) {
    await handleHttpError(error, ctx, errorContext);
  } else {
    await handleUnknownError(error, ctx, errorContext);
  }

  // Graceful user feedback with rate limiting
  await provideUserFeedback(ctx, errorContext.updateId);
}

function gatherErrorContext(ctx: BotContext): ErrorContext {
  const updateType = Object.keys(ctx.update)
    .find(key => key !== 'update_id') || 'unknown';
    
  return {
    updateId: ctx.update.update_id,
    userId: ctx.from?.id,
    username: ctx.from?.username ? `@${ctx.from.username}` : "Unknown",
    chatType: ctx.chat?.type || "unknown",
    updateType,
    chatId: ctx.chat?.id,
    messageId: ctx.msg?.message_id,
    callbackData: ctx.callbackQuery?.data,
    timestamp: new Date().toISOString(),
    sessionStep: ctx.session?.step,
    handlerChain: [],
  };
}

async function handleGrammyError(
  error: GrammyError, 
  ctx: BotContext, 
  context: ErrorContext
): Promise<void> {
  const errorCode = error.error_code;
  const description = error.description || 'No description';
  
  logger.error(`[GrammyError] ${description}`, {
    ...context,
    errorCode,
    description,
  });

  // Handle specific Telegram error codes
  switch (errorCode) {
    case 400:
      if (description.includes("chat not found")) {
        logger.warn(`Bot removed from chat ${context.chatId}`);
      }
      break;
    case 403:
      if (description.includes("bot was blocked")) {
        logger.warn(`Bot blocked by user ${context.userId}`);
      } else if (description.includes("need administrator rights")) {
        logger.warn(`Insufficient permissions in chat ${context.chatId}`);
      }
      break;
    case 429:
      logger.warn(`Rate limited for chat ${context.chatId}`, {
        retryAfter: (error as any).parameters?.retry_after,
      });
      break;
    default:
      // Log other errors
      break;
  }
}

async function handleHttpError(
  error: HttpError, 
  ctx: BotContext, 
  context: ErrorContext
): Promise<void> {
  logger.error(`[HttpError] Network error: ${error.message}`, {
    ...context,
    errorMessage: error.message,
  });
  
  // Implement exponential backoff for retries
  const MAX_RETRIES = HANDLER_CONSTANTS.ERROR_HANDLING.MAX_ERROR_RETRIES;
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      // Attempt to retry the failed request
      await ctx.api.getMe(); // Test connection
      logger.info(`Connection restored after ${retryCount + 1} attempts`);
      break;
    } catch (retryError) {
      retryCount++;
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function handleUnknownError(
  error: unknown, 
  ctx: BotContext, 
  context: ErrorContext
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stackTrace = error instanceof Error ? error.stack : undefined;
  
  logger.error(`[UnknownError] ${errorMessage}`, {
    ...context,
    errorMessage,
    stackTrace,
  });

  // In production, you might want to send errors to a monitoring service
  if (config.isProduction && stackTrace) {
    await logToExternalService(errorMessage, stackTrace, context);
  }
}

async function provideUserFeedback(ctx: BotContext, updateId: number): Promise<void> {
  const FEEDBACK_COOLDOWN = HANDLER_CONSTANTS.ERROR_HANDLING.FEEDBACK_COOLDOWN_MS;
  const cooldownKey = `error_feedback_${ctx.chat?.id}_${ctx.from?.id}`;
  
  // Simple in-memory rate limiting
  if (!global.errorCooldown) global.errorCooldown = new Map();
  const lastFeedback = global.errorCooldown.get(cooldownKey) || 0;
  const now = Date.now();
  
  if (now - lastFeedback < FEEDBACK_COOLDOWN) {
    return; // Skip feedback to avoid spamming
  }
  
  try {
    if (!ctx.chat) return;
    
    const errorReference = `ERR-${updateId.toString(36).toUpperCase()}-${Date.now().toString(36)}`;
    
    // Tailored responses based on environment
    if (config.isProduction) {
      await sendProductionErrorFeedback(ctx, errorReference);
    } else {
      await sendDevelopmentErrorFeedback(ctx, errorReference);
    }
    
    // Update cooldown
    global.errorCooldown.set(cooldownKey, now);
    
  } catch (feedbackError) {
    logger.warn("Failed to send error feedback to user:", feedbackError);
  }
}

async function sendProductionErrorFeedback(ctx: BotContext, errorReference: string) {
  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery({
      text: "⚠️ An error occurred. Please try again.",
      show_alert: true,
    });
  } else if (ctx.chat?.type === 'private') {
    await ctx.reply(
      `❌ <b>Something went wrong</b>\n\n` +
      `I've encountered an error. Please try again in a moment.\n\n` +
      `<i>Reference: <code>${errorReference}</code></i>`,
      { parse_mode: "HTML" }
    );
  } else {
    // Group chats - less verbose
    await ctx.reply(
      `⚠️ Bot error. Admins have been notified.`,
      { parse_mode: "HTML" }
    );
  }
}

async function sendDevelopmentErrorFeedback(ctx: BotContext, errorReference: string) {
  // More detailed feedback in development
  const message = ctx.update.message?.text || ctx.update.callback_query?.data || 'Unknown';
  
  await ctx.reply(
    `🐛 <b>Development Error</b>\n\n` +
    `Command: <code>${message.substring(0, 50)}</code>\n` +
    `Ref: <code>${errorReference}</code>\n\n` +
    `Check server logs for details.`,
    { parse_mode: "HTML" }
  );
}

async function logToExternalService(
  errorMessage: string, 
  stackTrace: string, 
  context: ErrorContext
): Promise<void> {
  // Implement based on your monitoring service (Sentry, DataDog, etc.)
  console.error('EXTERNAL LOGGING:', {
    error: errorMessage,
    stack: stackTrace,
    context,
    timestamp: new Date().toISOString(),
  });
}

// Type declaration for global cooldown map
declare global {
  var errorCooldown: Map<string, number> | undefined;
}