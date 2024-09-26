import { Schema, model, Types, Document, models } from "mongoose";

export interface IThumbnail {
  fileId: Types.ObjectId;
  width: number;
  height: number;
}

export interface IFile {
  fileId: Types.ObjectId;
  name: string;
  size: number;
  contentType: string;
  thumbnail?: IThumbnail;
}

export interface IAttachment extends Document {
  accountId: Types.ObjectId;
  type: "file" | "link" | "ref";
  file?: IFile;
  link?: string;
  ref?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const thumbnailSchema = new Schema<IThumbnail>(
  {
    fileId: { type: Schema.Types.ObjectId, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false },
);

export const fileSchema = new Schema<IFile>(
  {
    fileId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    contentType: { type: String, required: true },
    thumbnail: { type: thumbnailSchema },
  },
  { _id: false },
);

export const attachmentSchema = new Schema<IAttachment>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account" },
    type: {
      type: String,
      enum: ["file", "link", "ref"],
      required: true,
    },
    file: { type: fileSchema },
    link: { type: String },
    ref: { type: Types.ObjectId },
  },
  { timestamps: true },
);

const Attachment =
  models.Attachment || model<IAttachment>("Attachment", attachmentSchema);

export default Attachment;
