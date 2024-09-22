import { ObjectId } from "mongodb";
import path from "path";
import {
  deleteFromGridFS,
  downloadFromGridFS,
  getCollection,
  uploadToGridFS,
} from "../lib/mongodb";
import { createThumbnail, hasThumbnail } from "../utils/thumbnail";
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
    const { buffer, width, height, format } = await createThumbnail(file);

    const oldExt = path.extname(file.originalname);
    const newExt = `.${format}`;
    const filename = file.originalname.replace(oldExt, newExt);
    const contentType = `image/${format}`;

    const thumbnailId = await uploadToGridFS(
      buffer,
      filename,
      contentType,
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

export async function createRef(id: ObjectId): Promise<Attachment | null> {
  const collection = await getCollection("attachments");

  const referenced = await collection.findOne({ _id: id });
  if (!referenced) return null;

  const result = await collection.insertOne({
    type: "ref",
    ref: id,
  });

  return {
    id: result.insertedId,
    type: "ref",
    ref: id,
  };
}

export async function findById(id: ObjectId): Promise<Attachment | null> {
  const collection = await getCollection("attachments");

  const document = await collection.findOne({ _id: id });
  if (!document) return null;

  const attachment: Attachment = {
    id: document._id,
    type: document.type,
  };

  if (document.file) attachment.file = document.file;
  if (document.link) attachment.link = document.link;
  if (document.ref) attachment.ref = document.ref;

  return attachment;
}

export async function downloadFileById(id: ObjectId): Promise<Buffer | null> {
  const collection = await getCollection("attachments");

  const document = await collection.findOne({ _id: id });
  if (!document || !document.file) return null;

  return downloadFromGridFS(document.file.gridId, "files");
}

export async function downloadThumbnailById(
  id: ObjectId,
): Promise<Buffer | null> {
  const collection = await getCollection("attachments");

  const document = await collection.findOne({ _id: id });
  if (!document || !document.file || !document.file.thumbnail) return null;

  return downloadFromGridFS(document.file.thumbnail.gridId, "thumbnails");
}

export async function findByIds(ids: ObjectId[]): Promise<Attachment[]> {
  const collection = await getCollection("attachments");

  const documents = await collection.find({ _id: { $in: ids } }).toArray();

  return documents.map((doc) => {
    const attachment: Attachment = {
      id: doc._id,
      type: doc.type,
    };

    if (doc.file) attachment.file = doc.file;
    if (doc.link) attachment.link = doc.link;
    if (doc.ref) attachment.ref = doc.ref;

    return attachment;
  });
}

export async function deleteByIds(ids: ObjectId[]): Promise<void> {
  const collection = await getCollection("attachments");

  const documents = await collection.find({ _id: { $in: ids } }).toArray();

  for (const doc of documents) {
    if (!doc.file) continue;
    deleteFromGridFS(doc.file.gridId, "files").catch(logError);

    if (!doc.file.thumbnail) continue;
    deleteFromGridFS(doc.file.thumbnail.gridId, "thumbnails").catch(logError);
  }

  await collection.deleteMany({ _id: { $in: ids } });
}
