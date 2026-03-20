type LogLevel = "info" | "warn" | "error";

const writeLog = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const payload = {
    level,
    message,
    ...(meta ? { meta } : {}),
    timestamp: new Date().toISOString()
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
};

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => writeLog("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => writeLog("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => writeLog("error", message, meta)
};
