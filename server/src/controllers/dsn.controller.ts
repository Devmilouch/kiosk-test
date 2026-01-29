import type { Request, Response, NextFunction } from "express";

export const dsnController = {
  async parseDsnFile(req: Request, res: Response, next: NextFunction) {
    try {
      // At this point, the file has already been validated by the middleware
      const file = req.file!; // Non-null assertion as validated by middleware

      // Extract file content
      const fileContent = file.buffer.toString("utf-8");

      // File information for response
      const fileInfo = {
        message: "DSN file uploaded successfully",
        filename: file.originalname,
        size: file.size,
        content: fileContent,
      };

      console.log(`DSN file received: ${file.originalname} (${file.size} bytes)`);

      return res.status(200).json(fileInfo);
    } catch (error) {
      return next(error);
    }
  },
};
