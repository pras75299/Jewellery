import { z } from "zod";

// Validate environment variables at application startup
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Optional: Admin password for seed (ONLY for development)
  ADMIN_PASSWORD: z.string().optional(),
  // Optional: Test user password for seed (ONLY for development)
  TEST_USER_PASSWORD: z.string().optional(),
});

export const env = envSchema.parse(process.env);

