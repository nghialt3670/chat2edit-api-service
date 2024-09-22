import { z } from "zod";
import uploadedFileSchema from "./uploaded-file-schema";

const uploadSingleFileSchema = z.object({
  file: uploadedFileSchema,
});

export default uploadSingleFileSchema;
