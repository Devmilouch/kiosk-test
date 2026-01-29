import { DsnParser } from "../core/parsers/dsn.parser";
import type { ParsedDsnData } from "../core/parsers/dsn.parser";

export interface ProcessedDsnFile {
  message: string;
  filename: string;
  size: number;
  content: string;
  parsedData: ParsedDsnData;
  summary: ReturnType<typeof DsnParser.extractSummaryStats>;
}

/**
 * Process uploaded DSN file from buffer to structured response
 * @param file - Multer file object with buffer
 * @returns Processed DSN data with parsing results and summary
 * @throws Error if parsing fails
 */
export function processDsnFile(file: Express.Multer.File): ProcessedDsnFile {
  // Extract file content from buffer
  const fileContent = file.buffer.toString("utf-8");
  
  console.log(`📁 Processing DSN file: ${file.originalname} (${file.size} bytes)`);

  // Parse DSN content into structured data
  const parsedData = DsnParser.parseDsnContent(fileContent, file.originalname);

  // Extract summary statistics for easier consumption
  const summary = DsnParser.extractSummaryStats(parsedData);

  // Log processing completion
  console.log(
    `✅ DSN processing completed: ${summary.totalEmployees} employees across ${summary.totalEstablishments} establishments`
  );

  // Build structured response
  return {
    message: "DSN file uploaded and parsed successfully",
    filename: file.originalname,
    size: file.size,
    content: fileContent, // Keep raw content for debugging/validation
    parsedData,
    summary
  };
}