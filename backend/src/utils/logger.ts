/**
 * Industry-grade Logger Utility
 * Designed to be swappable with Sentry/Logtail.
 */
class Logger {
    private isProduction = process.env.NODE_ENV === "production";

    info(message: string, context?: any) {
        this.log("INFO", message, context);
    }

    warn(message: string, context?: any) {
        this.log("WARN", message, context);
    }

    error(message: string, error?: Error | any, context?: any) {
        const errorDetails = error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error;

        this.log("ERROR", message, { ...context, error: errorDetails });

        // FUTURE: Sentry.captureException(error);
    }

    debug(message: string, context?: any) {
        if (!this.isProduction) {
            this.log("DEBUG", message, context);
        }
    }

    private log(level: string, message: string, context?: any) {
        const timestamp = new Date().toISOString();
        const logData = {
            timestamp,
            level,
            message,
            ...(context || {}),
        };

        if (this.isProduction) {
            // Production: structured JSON logging (optimal for LogDNA/Logtail)
            console.log(JSON.stringify(logData));
        } else {
            // Development: Human-readable logging
            const colorMap: Record<string, string> = {
                INFO: "\x1b[32m", // Green
                WARN: "\x1b[33m", // Yellow
                ERROR: "\x1b[31m", // Red
                DEBUG: "\x1b[36m", // Cyan
            };
            const reset = "\x1b[0m";
            const color = colorMap[level] || reset;

            console.log(`[${timestamp}] ${color}${level}${reset}: ${message}`);
            if (context && Object.keys(context).length > 0) {
                console.dir(context, { depth: null, colors: true });
            }
        }
    }
}

export const logger = new Logger();
export default logger;
