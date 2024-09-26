import { z } from "zod";
import { toObjectId } from "../utils/object-id";
import { ObjectId } from "mongodb";

const objectIdSchema = z.union([z.string().refine(ObjectId.isValid).transform(toObjectId), z.instanceof(ObjectId)]);

export default objectIdSchema;
