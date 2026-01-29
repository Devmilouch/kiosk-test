import type { Request, Response, NextFunction } from "express";
import { processDsnFile } from "../services/dsn.service";

export const dsnController = {
  async parseDsnFile(req: Request, res: Response, next: NextFunction) {
    try {
      // At this point, the file has already been validated by the middleware
      const file = req.file!; // Non-null assertion as validated by middleware

      // Delegate DSN processing to service (synchronous)
      const processedData = processDsnFile(file);

      // Return processed DSN data
      return res.status(200).json(processedData);
    } catch (error) {
      console.error("Error in DSN controller:", error);
      return next(error);
    }
  },
};
