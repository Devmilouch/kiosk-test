import { DSNFileReader, DSNDataReader, type DSNData } from "../core/parsers/dsn.parser";

export interface ProcessedDsnFile {
  message: string;
  filename: string;
  size: number;
  declaration: any; // All structured DSN data
  dsnData: DSNData; // Raw parsed data
}

/**
 * Process uploaded DSN file from buffer to structured response
 * @param file - Multer file object with buffer
 * @returns All structured DSN data for frontend processing
 * @throws Error if parsing fails
 */
export async function processDsnFile(file: Express.Multer.File): Promise<ProcessedDsnFile> {
  // Extract file content from buffer
  const fileContent = file.buffer.toString("utf-8");

  console.log(`📁 Processing DSN file: ${file.originalname} (${file.size} bytes)`);

  try {
    // Parse DSN content using GitHub parser
    const dsnData: DSNData = await DSNFileReader(fileContent);
    const declaration = await DSNDataReader(dsnData);

    console.log(`✅ DSN parsing completed: ${dsnData.rows.length} rows parsed`);

    // Return ALL data for frontend processing
    return {
      message: "DSN file uploaded and parsed successfully",
      filename: file.originalname,
      size: file.size,
      declaration, // Complete structured declaration
      dsnData, // Raw parsed rows for debugging
    };
  } catch (error) {
    console.error(`DSN parsing failed:`, error);
    throw new Error(`Failed to parse DSN file: ${error}`);
  }
}
