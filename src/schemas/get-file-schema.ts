import { z } from "zod";

const getFileOrThumbnailSchema = z.object({
  query: z.object({
    attachmentId: z.string(),
  }),
});

export default getFileOrThumbnailSchema;
