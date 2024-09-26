import { z } from "zod";
import objectIdSchema from "../object-id.schema";

export const thumbnailResponseSchema = z.object({
  width: z.number(),
  height: z.number(),
});

export const fileResponseSchema = z.object({
  name: z.string(),
  size: z.number(),
  contentType: z.string(),
  thumbnail: thumbnailResponseSchema.optional(),
});

const attachmentResponseSchema = z.object({
  id: objectIdSchema,
  type: z.enum(["file", "link", "ref"]),
  file: fileResponseSchema.optional(),
  link: z.string().url().optional(),
  ref: objectIdSchema.optional(),
});

export default attachmentResponseSchema;
