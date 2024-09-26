import { z } from "zod";
import { MAX_MESSAGE_ATTACHMENTS } from "../../config/message.config";
import multerFileSchema from "../multer-file.schema";

const uploadFilesRequestSchema = z.object({
  files: z.array(multerFileSchema).min(1).max(MAX_MESSAGE_ATTACHMENTS),
});

export default uploadFilesRequestSchema;
