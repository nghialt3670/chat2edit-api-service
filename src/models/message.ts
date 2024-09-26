import { Schema, model, Document, models, Types } from "mongoose";
import { attachmentSchema } from "./attachment";
import { IAttachment } from "./attachment";

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  type: "request" | "response";
  text: string;
  attachments?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId },
    type: { type: String, enum: ["request", "response"], required: true },
    text: { type: String, required: true },
    attachments: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
  },
  { timestamps: true },
);

const Message = models.Message || model<IMessage>("Message", messageSchema);

export default Message;
