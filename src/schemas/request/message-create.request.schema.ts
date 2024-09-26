import { z } from "zod";
import { MAX_MESSAGE_ATTACHMENTS } from "../../config/message.config";
import objectIdSchema from "../object-id.schema";

const messageCreateRequestSchema = z.object({
  query: z.object({ chatId: objectIdSchema.optional() }),
  body: z.object({
    text: z.string().min(1).max(200),
    attachmentIds: z.array(objectIdSchema).max(MAX_MESSAGE_ATTACHMENTS),
  }),
});

export default messageCreateRequestSchema;
