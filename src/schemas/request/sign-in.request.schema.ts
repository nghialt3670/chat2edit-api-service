import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().min(1),
  image: z.string().optional(),
});

export const accountCreateSchema = z.object({
  type: z.string().min(1),
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
  refresh_token: z.string().optional(),
  access_token: z.string().optional(),
  expires_at: z.number().optional(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
  id_token: z.string().optional(),
});

const signInRequestSchema = z.object({
  body: z.object({
    user: userCreateSchema,
    account: accountCreateSchema,
  }),
});

export default signInRequestSchema;
