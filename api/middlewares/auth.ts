import { Request, Response, NextFunction } from "express";
import { LogError, LogInformation } from "../../src/services/logger";
import { getGuest } from "../../src/services/guests";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers.authorization;
    const checkIfUserExists = await getGuest(userId!);
    if (!checkIfUserExists) {
      LogError(`User is not exists`);
      return res.sendStatus(401);
    }
    LogInformation(`UserId: ${userId} - ${checkIfUserExists?.email}}`);
    return next();
  } catch (err) {
    LogError(`Error in middleware: ${err}`);
  }
}