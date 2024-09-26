import { Schema, model, Document, models, Types } from "mongoose";
import { IMessage, messageSchema } from "./message";

export interface ISettings extends Document {
  language: "vi" | "en";
  provider: "fabric";
  llm: "gpt-3.5-turbo" | "gemini-1.5-flash";
  maxChatPhases: number;
  maxPromptPhases: number;
}

export interface IChat extends Document {
  accountId: Types.ObjectId;
  title?: string;
  settings: ISettings;
  lastMessage: IMessage;
  shareId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const settingsSchema = new Schema<ISettings>(
  {
    language: {
      type: String,
      enum: ["vi", "en"],
      required: true,
      default: "en",
    },
    provider: {
      type: String,
      enum: ["fabric"],
      required: true,
      default: "fabric",
    },
    llm: {
      type: String,
      enum: ["gpt-3.5-turbo", "gemini-1.5-flash"],
      required: true,
      default: "gemini-1.5-flash",
    },
    maxChatPhases: {
      type: Number,
      required: true,
      default: 5,
    },
    maxPromptPhases: {
      type: Number,
      required: true,
      default: 3,
    },
  },
  { _id: false },
);

export const chatSchema = new Schema<IChat>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account" },
    title: { type: String, default: "Untitled Chat" },
    settings: {
      type: settingsSchema,
      required: true,
      default: () => ({}),
    },
    lastMessage: { type: messageSchema },
    shareId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true },
);

const Chat = models.Chat || model<IChat>("Chat", chatSchema);

export default Chat;
