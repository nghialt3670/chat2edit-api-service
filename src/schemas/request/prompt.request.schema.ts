import { z } from "zod";
import { ATTACHMENT_FILE_MAX_SIZE } from "../../config/message.config";
import multerFileSchema from "../multer-file.schema";
import objectIdSchema from "../object-id.schema";

const promptRequestSchema = z.object({
  query: z.object({
    chatId: objectIdSchema,
    text: z.string().min(1).max(200),
  }),
  body: z.array(multerFileSchema).max(ATTACHMENT_FILE_MAX_SIZE),
});

export default promptRequestSchema;
