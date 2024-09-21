import { ObjectId } from "mongodb";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .refine((id) => ObjectId.isValid(id), "Invalid ObjectId format");

export default objectIdSchema;
