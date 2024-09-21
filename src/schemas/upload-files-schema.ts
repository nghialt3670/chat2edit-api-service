import { z } from "zod";

const uploadFilesSchema = z.object({
  files: z
    .array(
      z.object({
        originalname: z.string(),
        buffer: z.instanceof(Buffer),
      }),
    )
    .min(1, "No files provided"),
});

export default uploadFilesSchema;
