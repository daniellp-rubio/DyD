import { sendToDiscord, LogLevel } from "./discord-transport";

interface LogParams {
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  error?: unknown;
}

const isProd = process.env.NODE_ENV === "production";

export class Logger {
  static debug(params: LogParams | string) {
    this.log("debug", params);
  }

  static info(params: LogParams | string) {
    this.log("info", params);
  }

  static warn(params: LogParams | string) {
    this.log("warn", params);
  }

  static error(params: LogParams | string) {
    this.log("error", params);
  }

  private static log(level: LogLevel, params: LogParams | string) {
    const normalized: LogParams =
      typeof params === "string" ? { title: "Log", message: params } : params;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] ${normalized.title}:`;

    if (!isProd) {
      switch (level) {
        case "info":
          console.info(prefix, normalized.message);
          break;
        case "warn":
          console.warn(prefix, normalized.message, normalized.metadata ?? "");
          break;
        case "error":
          console.error(prefix, normalized.message, normalized.error ?? "");
          break;
        case "debug":
          console.log(prefix, normalized.message);
          break;
      }
    }

    sendToDiscord({
      level,
      title: normalized.title,
      message: normalized.message,
      metadata: normalized.metadata,
      error: normalized.error instanceof Error ? normalized.error : undefined,
    });
  }
}
