import { z } from "zod";
import { toObjectIds } from "../utils/object-id";
import { splitComma } from "../utils/url-query";

const getOrDeleteManySchema = z.object({
  query: z.object({
    ids: z.string().transform(splitComma).transform(toObjectIds),
  }),
});

export default getOrDeleteManySchema;
