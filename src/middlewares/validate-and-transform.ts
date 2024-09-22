import { Request, Response } from "express";
import { z, ZodError } from "zod";

export default function validateAndTransform(schema: z.ZodSchema) {
  return (request: Request, response: Response, next: Function) => {
    try {
      const parsed = schema.parse({
        params: request.params,
        query: request.query,
        files: request.files,
        body: request.body,
      });

      request.params = parsed.params;
      request.query = parsed.query;
      request.body = parsed.body;

      next();
    } catch (e) {
      return response.status(422).send(e instanceof ZodError ? e.errors : e);
    }
  };
}
