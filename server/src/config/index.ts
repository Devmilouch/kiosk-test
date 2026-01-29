import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .transform(Number)
    .refine(n => n > 0 && n < 65536, "Port must be between 1-65535"),
  NODE_ENV: z.enum(["development", "production"]),
  CORS_ORIGIN: z.string().min(1, "CORS origin cannot be empty"),
});

// env configuration
let config: Config;

try {
  config = envSchema.parse(process.env);
} catch (error) {
  console.error("Environment configuration failed: ", error);
  console.error("\nPlease check your .env file or environment variables.");
  process.exit(1);
}

// Export
export { config };
export type Config = z.infer<typeof envSchema>;
