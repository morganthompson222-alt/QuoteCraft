type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp?: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  error?: string;
}

function log(entry: LogEntry) {
  const formatted = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  switch (entry.level) {
    case "error":
      console.error(JSON.stringify(formatted));
      break;
    case "warn":
      console.warn(JSON.stringify(formatted));
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production" || process.env.DEBUG) {
        console.debug(JSON.stringify(formatted));
      }
      break;
    default:
      console.log(JSON.stringify(formatted));
  }
}

export const logger = {
  info: (msg: string, data?: Partial<LogEntry>) =>
    log({ level: "info", message: msg, ...data }),
  warn: (msg: string, data?: Partial<LogEntry>) =>
    log({ level: "warn", message: msg, ...data }),
  error: (msg: string, data?: Partial<LogEntry>) =>
    log({ level: "error", message: msg, ...data }),
  debug: (msg: string, data?: Partial<LogEntry>) =>
    log({ level: "debug", message: msg, ...data }),
};
