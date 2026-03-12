import "dotenv/config";
import winston from "winston";

const { combine, timestamp, colorize, printf, json } = winston.format;

// Human-readable format for dev
const devFormat = combine(
	colorize(),
	timestamp({ format: "HH:mm:ss" }),
	printf(({ level, message, timestamp, ...meta }) => {
		const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : "";
		return `${timestamp} [${level}]: ${message} ${metaStr}`;
	}),
);

// JSON format for production — structured logs that AWS CloudWatch can parse
const prodFormat = combine(timestamp(), json());

export const logger = winston.createLogger({
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
	format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
	transports: [new winston.transports.Console()],
});
