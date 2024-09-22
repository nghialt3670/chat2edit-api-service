import { z } from "zod";
import { toObjectIds } from "../utils/object-id";

const createRefsSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1).transform(toObjectIds),
  }),
});

export default createRefsSchema;
