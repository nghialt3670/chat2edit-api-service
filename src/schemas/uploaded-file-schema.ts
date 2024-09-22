import { z } from "zod";
import { FILE_MAX_SIZE } from "../configs/file";

const uploadedFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  buffer: z.instanceof(Buffer),
  size: z.number().lte(FILE_MAX_SIZE),
});

export default uploadedFileSchema;
