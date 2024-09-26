import { z } from "zod";

const languageSchema = z.enum(["vi", "en"]);
const providerSchema = z.enum(["fabric"]);

const chatSettingsSchema = z.object({
  language: languageSchema,
  provider: providerSchema,
});

export default chatSettingsSchema;
