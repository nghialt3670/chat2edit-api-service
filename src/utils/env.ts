import { configDotenv } from "dotenv";
import { z } from "zod";

const envSchema = z.object({
  PROMPT_SERVICE_API_BASE_URL: z.string().url(),
  MONGO_URI: z.string().url(),
  PORT: z.string().transform(Number),
});

configDotenv();

const ENV = envSchema.parse(process.env);

export default ENV;
