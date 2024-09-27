import { z } from "zod";
import chatSettingsSchema from "../chat-settings.schema";

const chatCreateRequestSchema = z.object({
  body: z.object({
    settings: chatSettingsSchema,
  }),
});

export default chatCreateRequestSchema;
