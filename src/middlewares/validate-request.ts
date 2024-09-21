import { Request, Response } from "express";
import { z, ZodError } from "zod";

export default function validateRequest(schema: z.ZodSchema) {
  return (request: Request, response: Response, next: Function) => {
    try {
      schema.parse({
        body: request.body,
        query: request.query,
        params: request.params,
        files: request.files,
      });
      next();
    } catch (e) {
      return response.status(422).send(e instanceof ZodError ? e.errors : e);
    }
  };
}
