import { z } from "zod";
import { toObjectId } from "../utils/object-id";

const getFileOrThumbnailSchema = z.object({
  params: z.object({
    id: z.string().transform(toObjectId),
  }),
});

export default getFileOrThumbnailSchema;
