/**
 * Utility functions for formatting data
 */
export class Formatters {
  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  static formatPercent(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
  }

  /**
   * Format cryptocurrency
   */
  static formatCrypto(amount: number, symbol: string = "BTC"): string {
    const symbols: Record<string, string> = {
      BTC: "₿",
      ETH: "Ξ",
      USDT: "💎",
      USDC: "💵",
    };

    const prefix = symbols[symbol] || symbol;

    if (amount < 0.000001) {
      return `${prefix}${amount.toFixed(8)}`;
    } else if (amount < 0.001) {
      return `${prefix}${amount.toFixed(6)}`;
    } else if (amount < 1) {
      return `${prefix}${amount.toFixed(4)}`;
    } else {
      return `${prefix}${amount.toFixed(2)}`;
    }
  }

  /**
   * Format mining speed
   */
  static formatHashRate(hashRate: number): string {
    if (hashRate >= 1000000000) {
      return `${(hashRate / 1000000000).toFixed(2)} GH/s`;
    } else if (hashRate >= 1000000) {
      return `${(hashRate / 1000000).toFixed(2)} MH/s`;
    } else if (hashRate >= 1000) {
      return `${(hashRate / 1000).toFixed(2)} KH/s`;
    } else {
      return `${hashRate} H/s`;
    }
  }

  /**
   * Format date
   */
  static formatDate(date: Date | number): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Format time ago
   */
  static timeAgo(date: Date | number): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  }

  /**
   * Format progress bar
   */
  static progressBar(
    value: number,
    max: number = 100,
    length: number = 10
  ): string {
    const percentage = (value / max) * 100;
    const filledLength = Math.round((percentage / 100) * length);
    const emptyLength = length - filledLength;

    const filled = "█".repeat(filledLength);
    const empty = "░".repeat(emptyLength);

    return `[${filled}${empty}] ${percentage.toFixed(1)}%`;
  }

  /**
   * Truncate text with ellipsis
   */
  static truncate(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }

  /**
   * Escape HTML for Telegram
   */
  static escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}
