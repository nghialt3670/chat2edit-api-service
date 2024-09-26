import { z } from "zod";
import { ATTACHMENT_FILE_MAX_SIZE } from "../config/message.config";

const multerFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  buffer: z.instanceof(Buffer),
  size: z.number().lte(ATTACHMENT_FILE_MAX_SIZE),
});

export default multerFileSchema;
