import { ObjectId } from "mongodb";

export type AttachmentType = "file" | "link" | "ref";

export interface File {
  gridId: ObjectId;
  name: string;
  size: number;
  contentType: string;
  thumbnail?: Thumbnail;
}

export interface Thumbnail {
  gridId: ObjectId;
  width: number;
  height: number;
}

export default interface Attachment {
  id: ObjectId;
  type: AttachmentType;
  file?: File;
  link?: string;
  referencedId?: ObjectId;
}
