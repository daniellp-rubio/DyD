import { sendToDiscord, LogLevel } from "./discord-transport";

interface LogParams {
  title: string;
  message: string;
  metadata?: Record<string, any>;
  error?: any;
}

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
    const normalizedParams: LogParams = typeof params === "string" 
      ? { title: "Log", message: params } 
      : params;

    // 1. Console Output for local debugging
    const timestamp = new Date().toISOString();
    const consolePrefix = `[${timestamp}] [${level.toUpperCase()}] ${normalizedParams.title}:`;
    
    switch(level) {
      case "info": console.info(consolePrefix, normalizedParams.message); break;
      case "warn": console.warn(consolePrefix, normalizedParams.message, normalizedParams.metadata || ""); break;
      case "error": console.error(consolePrefix, normalizedParams.message, normalizedParams.error || ""); break;
      case "debug": console.log(consolePrefix, normalizedParams.message); break;
    }

    // 2. Dispatch to Discord (Fire and forget)
    sendToDiscord({
      level,
      title: normalizedParams.title,
      message: normalizedParams.message,
      metadata: normalizedParams.metadata,
      error: normalizedParams.error instanceof Error ? normalizedParams.error : undefined,
    });
  }
}
