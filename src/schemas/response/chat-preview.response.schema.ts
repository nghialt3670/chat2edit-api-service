import { z } from "zod";
import chatSettingsSchema from "../chat-settings.schema";
import objectIdSchema from "../object-id.schema";

const chatPreviewResponseSchema = z.object({
  id: objectIdSchema,
  title: z.string(),
  settings: chatSettingsSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export default chatPreviewResponseSchema;
