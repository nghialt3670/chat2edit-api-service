import { z } from "zod";
import messageResponseSchema from "./message.response.schema";
import chatSettingsSchema from "../chat-settings.schema";
import objectIdSchema from "../object-id.schema";

const chatDetailsResponseSchema = z.object({
  id: objectIdSchema,
  shareId: objectIdSchema.optional(),
  messages: z.array(messageResponseSchema),
  settings: chatSettingsSchema,
});

export default chatDetailsResponseSchema;
