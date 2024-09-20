import { ObjectId } from "mongodb";
import { generateThumbnail, hasThumbnail } from "../utils/thumbnail";
import { getCollection, uploadToGridFS } from "../lib/db";
import { File } from "../models/attachment";

export async function uploadFileAttachment(file: Express.Multer.File) {
  const collection = await getCollection("attachments");

  const fileId = await uploadToGridFS(
    file.buffer,
    file.originalname,
    file.mimetype,
    "files",
  );

  const fileModel: File = {
    gridId: fileId,
    name: file.originalname,
    size: file.size,
    contentType: file.mimetype,
  };

  if (hasThumbnail(file)) {
    const { buffer, width, height } = await generateThumbnail(file);

    const thumbnailId = await uploadToGridFS(
      buffer,
      file.originalname,
      "image/jpeg",
      "thumbnails",
    );

    fileModel.thumbnail = {
      gridId: thumbnailId,
      width,
      height,
    };
  }

  const result = await collection.insertOne({
    type: "file",
    file: fileModel,
  });

  return result.insertedId;
}

export default async function createReferenceAttachment(referencedId: string) {
  const collection = await getCollection("attachments");

  const id = new ObjectId(referencedId);
  const referenced = await collection.findOne({ _id: id });
  if (!referenced) throw new Error("Referenced attachment not found");

  const result = await collection.insertOne({
    type: "ref",
    referencedId: referenced._id,
  });

  return result.insertedId;
}

export async function findAttachmentById(id: string) {
  const collection = await getCollection("attachments");
  return await collection.findOne({ _id: new ObjectId(id) });
}
