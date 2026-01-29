import { DsnParser } from "../core/parsers/dsn.parser";
import { mapDsnToQuestions, type MappedAnswers } from "../core/mappers/dsnToQuestions.mapper";
import type { ParsedDsnData } from "../core/parsers/dsn.parser";

export interface ProcessedDsnFile {
  message: string;
  filename: string;
  size: number;
  content: string;
  parsedData: ParsedDsnData;
  summary: ReturnType<typeof DsnParser.extractSummaryStats>;
  mappedAnswers: MappedAnswers;
}

/**
 * Process uploaded DSN file from buffer to structured response
 * @param file - Multer file object with buffer
 * @returns Processed DSN data with parsing results, summary, and mapped answers
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

  // Map DSN data to question answers
  const mappedAnswers = mapDsnToQuestions(parsedData);

  // Log processing completion
  console.log(
    `✅ DSN processing completed: ${summary.totalEmployees} employees across ${summary.totalEstablishments} establishments, ${Object.keys(mappedAnswers).length} questions mapped`
  );

  // Build structured response
  return {
    message: "DSN file uploaded, parsed, and mapped successfully",
    filename: file.originalname,
    size: file.size,
    content: fileContent, // Keep raw content for debugging/validation
    parsedData,
    summary,
    mappedAnswers,
  };
}
