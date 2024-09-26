import { z } from "zod";
import multerFileSchema from "../multer-file.schema";

const uploadFileRequestSchema = z.object({
  file: multerFileSchema,
});

export default uploadFileRequestSchema;
