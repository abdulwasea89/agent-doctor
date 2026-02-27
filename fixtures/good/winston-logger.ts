import { createLogger, transports } from "winston";

const logger = createLogger({
  level: "info",
  format: require("winston").format.combine(
    require("winston").format.timestamp(),
    require("winston").format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "error.log", level: "error" }),
  ],
});

logger.info("Application started");
logger.error("Something went wrong");
