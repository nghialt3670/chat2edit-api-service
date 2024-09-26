import { z } from "zod";
import objectIdSchema from "../object-id.schema";

const signInResponseSchema = z.object({
  userId: objectIdSchema,
  accountId: objectIdSchema,
});

export default signInResponseSchema;
