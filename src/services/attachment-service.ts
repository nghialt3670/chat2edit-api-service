import { ObjectId } from "mongodb";
import {
  deleteFromGridFS,
  downloadFromGridFS,
  getCollection,
  uploadToGridFS,
} from "../lib/mongodb";
import { generateThumbnail, hasThumbnail } from "../utils/thumbnail";
import Attachment, { File } from "../models/attachment";
import { logError } from "../utils/error";

export async function uploadFile(
  file: Express.Multer.File,
): Promise<Attachment> {
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

  return {
    id: result.insertedId,
    type: "file",
    file: fileModel,
  };
}

export default async function createReference(
  referencedId: string,
): Promise<Attachment> {
  const collection = await getCollection("attachments");

  const id = new ObjectId(referencedId);
  const referenced = await collection.findOne({ _id: id });
  if (!referenced) throw new Error("Referenced attachment not found");

  const result = await collection.insertOne({
    type: "ref",
    referencedId: referenced._id,
  });

  return {
    id: result.insertedId,
    type: "ref",
    referencedId: referenced._id,
  };
}

export async function findById(id: string): Promise<Attachment | null> {
  const collection = await getCollection("attachments");

  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  const attachment: Attachment = {
    id: doc._id,
    type: doc.type,
  };

  if (doc.file) attachment.file = doc.file;
  if (doc.link) attachment.link = doc.link;
  if (doc.referencedId) attachment.referencedId = doc.referencedId;

  return attachment;
}

export async function downloadFileById(id: string): Promise<Buffer | null> {
  const collection = await getCollection("attachments");

  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc || !doc.file) return null;

  return downloadFromGridFS(doc.file.gridId, "files");
}

export async function downloadThumbnailById(
  id: string,
): Promise<Buffer | null> {
  const collection = await getCollection("attachments");

  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc || !doc.file || !doc.file.thumbnail) return null;

  return downloadFromGridFS(doc.file.thumbnail.gridId, "thumbnails");
}

export async function deleteByIds(ids: string[]): Promise<void> {
  const collection = await getCollection("attachments");

  const objectIds = ids.map((id) => new ObjectId(id));
  const docs = await collection.find({ _id: { $in: objectIds } }).toArray();

  for (const doc of docs) {
    if (!doc.file) continue;

    deleteFromGridFS(doc.file.gridId, "files").catch(logError);

    if (doc.file.thumbnail)
      deleteFromGridFS(doc.file.thumbnail.gridId, "thumbnails").catch(logError);
  }

  await collection.deleteMany({ _id: { $in: objectIds } });
}
