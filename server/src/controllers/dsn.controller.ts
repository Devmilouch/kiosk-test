import type { Request, Response, NextFunction } from "express";
import { DsnParserService } from "../services/dsnParser.service";

export const dsnController = {
  async parseDsnFile(req: Request, res: Response, next: NextFunction) {
    try {
      // At this point, the file has already been validated by the middleware
      const file = req.file!; // Non-null assertion as validated by middleware

      // Extract file content
      const fileContent = file.buffer.toString("utf-8");

      console.log(`DSN file received: ${file.originalname} (${file.size} bytes)`);

      // Parse DSN content into structured data
      const parsedData = DsnParserService.parseDsnContent(fileContent, file.originalname);

      // Extract summary for easier consumption
      const summary = DsnParserService.extractSummaryStats(parsedData);

      // Response with both structured data and summary
      const response = {
        message: "DSN file uploaded and parsed successfully",
        filename: file.originalname,
        size: file.size,
        content: fileContent, // Keep raw content for debugging
        parsedData,
        summary,
      };

      console.log(
        `DSN parsing completed: ${summary.totalEmployees} employees across ${summary.totalEstablishments} establishments`
      );

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error parsing DSN file:", error);
      return next(error);
    }
  },
};
