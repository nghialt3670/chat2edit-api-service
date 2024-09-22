import { z } from "zod";
import uploadedFileSchema from "./uploaded-file-schema";
import { MAX_MULTIPLE_FILES } from "../configs/file";

const uploadMultipleFilesSchema = z.object({
  files: z.array(uploadedFileSchema).min(1).max(MAX_MULTIPLE_FILES),
});

export default uploadMultipleFilesSchema;
