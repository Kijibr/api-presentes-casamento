import winston, { createLogger } from "winston";

const Logger = createLogger({
  level: "debug",
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});


export const LogInformation = (message: string) => Logger.info(message);
export const LogError = (message: string) => Logger.error(message);