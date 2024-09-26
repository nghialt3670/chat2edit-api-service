import { z } from "zod";
import attachmentResponseSchema from "./attachment.response.schema";
import objectIdSchema from "../object-id.schema";

const messageResponseSchema = z.object({
  id: objectIdSchema,
  text: z.string().min(1),
  attachments: z.array(attachmentResponseSchema),
});

export default messageResponseSchema;
