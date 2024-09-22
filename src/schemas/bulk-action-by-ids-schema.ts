import { z } from "zod";
import { toObjectIds } from "../utils/object-id";
import { splitComma } from "../utils/url-query";

const bulkActionByIdsSchema = z.object({
  query: z.object({
    ids: z.string().transform(splitComma).transform(toObjectIds),
  }),
});

export default bulkActionByIdsSchema;
