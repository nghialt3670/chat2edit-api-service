import { z } from "zod";
import objectIdSchema from "../object-id.schema";

const queryAccountIdRequestSchema = z.object({
  query: z.object({ accountId: objectIdSchema }),
});

export default queryAccountIdRequestSchema;
