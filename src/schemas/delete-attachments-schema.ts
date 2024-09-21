import { z } from "zod";
import objectIdSchema from "./object-id-schema";

const deleteAttachmentsSchema = z.object({
  body: z.object({
    attachmentIds: z.array(objectIdSchema).min(1, "No attachment ID provided"),
  }),
});

export default deleteAttachmentsSchema;
