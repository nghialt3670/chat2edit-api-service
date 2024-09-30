import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import queryAccountIdRequestSchema from "../schemas/request/query-account-id.request.schema";
import Account from "../models/account";
import { logError } from "./error";

function recursiveMerge(
  schemaA: z.ZodSchema<any>,
  schemaB: z.ZodSchema<any>,
): z.ZodSchema<any> {
  if (schemaA instanceof z.ZodObject && schemaB instanceof z.ZodObject) {
    const shapeA = schemaA.shape;
    const shapeB = schemaB.shape;

    const mergedShape: Record<string, z.ZodTypeAny> = {};

    for (const key in shapeA)
      if (shapeB[key])
        mergedShape[key] = recursiveMerge(shapeA[key], shapeB[key]);
      else mergedShape[key] = shapeA[key];

    for (const key in shapeB) if (!shapeA[key]) mergedShape[key] = shapeB[key];

    return z.object(mergedShape);
  }

  // If the fields are not ZodObjects, use union
  return z.union([schemaA, schemaB]);
}

const handler = (
  schema: z.ZodObject<z.ZodRawShape>,
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req);

      if (parsed.params) req.params = parsed.params;
      if (parsed.query) req.query = parsed.query;
      if (parsed.body) req.body = parsed.body;
      if (parsed.files) req.files = parsed.files;
      if (parsed.file) req.file = parsed.file;

      await fn(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(error.errors);
        return res.status(422).json({ errors: error.errors });
      } else {
        logError(error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
};

export const authHandler = (
  schema: z.ZodObject<z.ZodRawShape>,
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mergedSchema = recursiveMerge(queryAccountIdRequestSchema, schema);
      const parsed = mergedSchema.parse(req);

      const accountId = parsed.query.accountId;
      const account = await Account.findById(accountId);
      if (!account) return res.status(401).send();

      if (parsed.params) req.params = parsed.params;
      if (parsed.query) req.query = parsed.query;
      if (parsed.body) req.body = parsed.body;
      if (parsed.files) req.files = parsed.files;
      if (parsed.file) req.file = parsed.file;

      fn(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(error.errors);
        return res.status(422).json({ errors: error.errors });
      } else {
        console.log(error)
        logError(error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
};

export default handler;
