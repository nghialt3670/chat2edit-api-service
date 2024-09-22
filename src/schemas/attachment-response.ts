import { ObjectId } from "mongodb";
import { AttachmentType } from "../models/attachment";

export interface FileResponse {
  name: string;
  size: number;
  content_type: string;
  thumbnail?: ThumbnailResponse;
}

export interface ThumbnailResponse {
  width: number;
  height: number;
}

export default interface AttachmentResponse {
  id: ObjectId;
  type: AttachmentType;
  file?: FileResponse;
  link?: string;
  ref?: ObjectId;
}
