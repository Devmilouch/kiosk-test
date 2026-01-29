import multer from "multer";
import path from "path";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";

// Zod validators (reusable and composable)
const fileValidators = {
  originalName: z.string().regex(/^[^<>:"/\\|?*]+\.txt$/i, "Unsupported file format (txt only)"),

  size: z
    .number()
    .min(1, "File too small")
    .max(10 * 1024 * 1024, "File too large (max 10MB)"),

  buffer: z.instanceof(Buffer).refine(buffer => buffer.length > 0, "Empty file not allowed"),
};

// Validation based on real Multer File type + Zod validators
const validateMulterFile = (file: Express.Multer.File): void => {
  // Use Zod validators on native type properties
  fileValidators.originalName.parse(file.originalname);
  fileValidators.size.parse(file.size);
  fileValidators.buffer.parse(file.buffer);
};

const multerMiddleware = multer({
  storage: multer.memoryStorage(), // In RAM for immediate processing
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Basic validation by Multer - Focus on DSN format (.txt)
    const allowed = [".txt"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Composed middleware: Upload + Zod Validation
export const uploadSingleFileMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Step 1: Upload with Multer
  multerMiddleware.single("dsn")(req, res, multerError => {
    if (multerError) {
      return res.status(400).json({
        error: "Upload error",
        details: multerError.message,
      });
    }

    // Step 2: Validation with Zod
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      // Business validation with typed function
      validateMulterFile(req.file);

      return next(); // All good, pass to next handler
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          error: "Invalid file",
          details: error.message,
        });
      }
      return next(error);
    }
  });
};
