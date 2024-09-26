import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import queryAccountIdRequestSchema from "../schemas/request/query-account-id.request.schema";
import Account from "../models/account";
import { logError } from "./error";

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
      const parsed = queryAccountIdRequestSchema.merge(schema).parse(req);

      const accountId = parsed.query.accountId;
      const account = await Account.findById(accountId);

      if (!account) res.status(401).send();

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
        logError(error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
};

export default handler;
