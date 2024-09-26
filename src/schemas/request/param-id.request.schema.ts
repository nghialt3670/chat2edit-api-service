import { z } from "zod";
import objectIdSchema from "../object-id.schema";

const paramIdRequestSchema = z.object({
  params: z.object({ id: objectIdSchema }),
});

export default paramIdRequestSchema;
