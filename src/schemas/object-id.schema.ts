import { ObjectId } from "mongodb";
import { z } from "zod";
import { toObjectId } from "../utils/object-id";

const objectIdSchema = z.union([
  z.string().refine(ObjectId.isValid).transform(toObjectId),
  z.instanceof(ObjectId),
]);

export default objectIdSchema;
