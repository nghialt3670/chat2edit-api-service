import { z } from "zod";
import objectIdSchema from "../object-id.schema";

const queryChatIdRequestSchema = z.object({
  query: z.object({ chatId: objectIdSchema }),
});

export default queryChatIdRequestSchema;
