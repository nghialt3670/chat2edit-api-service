import { z } from "zod";
import objectIdSchema from "./object-id-schema";

const createReferencesSchema = z.object({
  body: z.object({
    referencedIds: z.array(objectIdSchema).min(1, "No referenced ID provided"),
  }),
});

export default createReferencesSchema;
