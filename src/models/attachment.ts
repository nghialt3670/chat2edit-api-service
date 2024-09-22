import { ObjectId } from "mongodb";

export type AttachmentType = "file" | "link" | "ref";

export interface File {
  file_id: ObjectId;
  name: string;
  size: number;
  content_type: string;
  thumbnail?: Thumbnail;
}

export interface Thumbnail {
  file_id: ObjectId;
  width: number;
  height: number;
}

export default interface Attachment {
  _id?: ObjectId;
  type: AttachmentType;
  file?: File;
  link?: string;
  ref?: ObjectId;
}
