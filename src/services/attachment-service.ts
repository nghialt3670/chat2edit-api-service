import { Collection, ObjectId } from "mongodb";
import path from "path";
import {
  deleteFromGridFS,
  downloadFromGridFS,
  uploadToGridFS,
} from "../lib/db";
import Attachment, { File, Thumbnail } from "../models/attachment";
import { createThumbnail, hasThumbnail } from "../utils/thumbnail";
import { logError } from "../utils/error";

export default class AttachmentService {
  private collection: Collection<Attachment>;

  constructor(collection: Collection<Attachment>) {
    this.collection = collection;
  }

  findById = async (id: ObjectId): Promise<Attachment | null> => {
    return await this.collection.findOne({ _id: id });
  };

  findByIds = async (ids: ObjectId[]): Promise<Attachment[]> => {
    return this.collection.find({ _id: { $in: ids } }).toArray();
  };

  deleteById = async (id: ObjectId): Promise<void> => {
    const attachment = await this.collection.findOneAndDelete({ _id: id });
    if (!attachment) return;
    this.deleteFile(attachment);
  };

  deleteByIds = async (ids: ObjectId[]): Promise<void> => {
    const attachments = await this.findByIds(ids);
    for (const attachment of attachments) this.deleteFile(attachment);
    await this.collection.deleteMany({ _id: { $in: ids } });
  };

  createWithFile = async (file: Express.Multer.File): Promise<Attachment> => {
    const fileModel = await this.uploadFile(file);

    if (hasThumbnail(file))
      fileModel.thumbnail = await this.uploadFileThumbnail(file);

    const result = await this.collection.insertOne({
      type: "file",
      file: fileModel,
    });

    return {
      _id: result.insertedId,
      type: "file",
      file: fileModel,
    };
  };

  createReference = async (id: ObjectId): Promise<Attachment | null> => {
    const target = await this.collection.findOne({ _id: id });
    if (!target) return null;

    const result = await this.collection.insertOne({
      type: "ref",
      ref: id,
    });

    return {
      _id: result.insertedId,
      type: "ref",
      ref: id,
    };
  };

  downloadFileBuffer = async (id: ObjectId): Promise<Buffer | null> => {
    const attachment = await this.collection.findOne({ _id: id });
    const fileId = attachment?.file?.file_id;
    return fileId ? downloadFromGridFS(fileId, "files") : null;
  };

  downloadFileThumbnailBuffer = async (
    id: ObjectId,
  ): Promise<Buffer | null> => {
    const attachment = await this.collection.findOne({ _id: id });
    const fileId = attachment?.file?.thumbnail?.file_id;
    return fileId ? downloadFromGridFS(fileId, "thumbnails") : null;
  };

  private uploadFile = async (file: Express.Multer.File): Promise<File> => {
    const fileId = await uploadToGridFS(
      file.buffer,
      file.originalname,
      file.mimetype,
      "files",
    );

    return {
      file_id: fileId,
      name: file.originalname,
      size: file.size,
      content_type: file.mimetype,
    };
  };

  private uploadFileThumbnail = async (
    file: Express.Multer.File,
  ): Promise<Thumbnail> => {
    const { buffer, width, height, format } = await createThumbnail(file);

    const oldExt = path.extname(file.originalname);
    const newExt = `.${format}`;
    const filename = file.originalname.replace(oldExt, newExt);
    const contentType = `image/${format}`;

    const fileId = await uploadToGridFS(
      buffer,
      filename,
      contentType,
      "thumbnails",
    );

    return { file_id: fileId, width, height };
  };

  private deleteFile = async (attachment: Attachment): Promise<void> => {
    let fileId = attachment.file?.file_id;
    if (!fileId) return;
    deleteFromGridFS(fileId, "files").catch(logError);

    fileId = attachment.file?.thumbnail?.file_id;
    if (!fileId) return;
    deleteFromGridFS(fileId, "thumbnails").catch(logError);
  };
}
