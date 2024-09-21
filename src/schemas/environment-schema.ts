import { z } from "zod";

const environmentSchema = z.object({
  MONGO_URI: z.string(),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), "PORT must be a valid number"),
});

export default environmentSchema;
