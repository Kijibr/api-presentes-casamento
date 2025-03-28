import { Request, Response, NextFunction } from "express";
import { LogError, LogInformation } from "../../src/services/logger";
import { getGuest } from "../../src/services/guests";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers.authorization;
    
    if (!userId) {
      LogError("Authorization header is missing");
      return res.status(401).json({ error: "Authorization token not provided" });
    }

    const checkIfUserExists = await getGuest(userId);
    if (!checkIfUserExists) {
      LogError(`User does not exist: ${userId}`);
      return res.status(401).json({ error: "User not found" });
    }

    LogInformation(`UserId: ${userId} - ${checkIfUserExists.email}`);
    return next();
  } catch (err) {
    LogError(`Error in middleware: ${err}`);
    return res.status(500).json({ error: "Internal server error" });
  }
}