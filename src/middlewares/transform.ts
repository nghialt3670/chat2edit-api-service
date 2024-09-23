import { Request, Response } from "express";
import { z, ZodError } from "zod";

export default function transform(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: Function) => {
    try {
      const parsed = schema.parse({
        params: req.params,
        query: req.query,
        files: req.files,
        file: req.file,
        body: req.body,
      });

      req.params = parsed.params;
      req.query = parsed.query;
      req.body = parsed.body;

      next();
    } catch (e) {
      return res.status(422).send(e instanceof ZodError ? e.errors : e);
    }
  };
}
