import { z } from "zod";

const environmentSchema = z.object({
  MONGO_URI: z.string(),
  PORT: z.string().transform(Number),
});

export default environmentSchema;
