import { Request, Response } from "express";
import {
  deleteFromGridFS,
  downloadFromGridFS,
  uploadToGridFS,
} from "../lib/fs";
import uploadFilesRequestSchema from "../schemas/request/upload-files.request.schema";
import attachmentResponseSchema from "../schemas/response/attachment.response.schema";
import uploadFileRequestSchema from "../schemas/request/upload-file.request.schema";
import paramIdRequestSchema from "../schemas/request/param-id.request.schema";
import { createThumbnail, hasThumbnail } from "../utils/thumbnail";
import Attachment, { IFile } from "../models/attachment";
import { authHandler } from "../utils/handler";
import { scanBuffer } from "../lib/scan";

const responseSchema = attachmentResponseSchema;

export const getAttachmentById = authHandler(
  paramIdRequestSchema,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const accountId = req.query.accountId;

    const attachment = await Attachment.findById(id);
    if (!attachment) return res.status(404).send();

    if (!attachment.accountId.equals(accountId)) return res.status(403).send();

    const payload = responseSchema.parse(attachment);
    return res.json(payload);
  },
);

export const deleteAttachmentById = authHandler(
  paramIdRequestSchema,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const accountId = req.query.accountId;

    const attachment = await Attachment.findById(id);
    if (!attachment) return res.status(404).send();

    if (!attachment.accountId.equals(accountId)) return res.status(403).send();

    await Attachment.findByIdAndDelete(id);

    if (attachment.file) {
      deleteFromGridFS(attachment.file.fileId, "files");

      if (attachment.file.thumbnail)
        deleteFromGridFS(attachment.file.thumbnail.fileId, "thumbnails");
    }

    res.status(204).send();
  },
);

export const uploadFile = async (file: Express.Multer.File) => {
  const fileId = await uploadToGridFS(
    file.buffer,
    file.originalname,
    file.mimetype,
    "files",
  );

  const uploadedFile: IFile = {
    fileId,
    name: file.originalname,
    size: file.size,
    contentType: file.mimetype,
  };

  if (hasThumbnail(file)) {
    const { buffer, width, height, format } = await createThumbnail(file);
    const filename = `${file.originalname}.${format}`;
    const contentType = `image/${format}`;
    const fileId = await uploadToGridFS(
      buffer,
      filename,
      contentType,
      "thumbnails",
    );
    uploadedFile.thumbnail = { fileId, width, height };
  }

  return uploadedFile;
};

export const createFileAttachment = authHandler(
  uploadFileRequestSchema,
  async (req: Request, res: Response) => {
    const file = req.file!;
    const accountId = req.query.accountId;

    const isInfected = await scanBuffer(file.buffer);
    if (isInfected) return res.status(400).send();

    const uploadedFile = await uploadFile(file);
    const attachment = await Attachment.create({
      accountId,
      type: "file",
      file: uploadedFile,
    });

    const payload = responseSchema.parse(attachment);
    return res.status(201).json(payload);
  },
);

export const createFileAttachments = authHandler(
  uploadFilesRequestSchema,
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    const accountId = req.query.accountId;

    const scanPromises = files.map(async (file) => {
      const isInfected = await scanBuffer(file.buffer);
      if (isInfected) return res.status(400).send();
    });

    await Promise.all(scanPromises);

    const uploadPromises = files.map(uploadFile);
    const uploadedFiles = await Promise.all(uploadPromises);
    const attachmentCreates = uploadedFiles.map((file) => ({
      accountId,
      type: "file",
      file,
    }));

    const attachments = await Attachment.insertMany(attachmentCreates);

    const payload = attachments.map((a) => responseSchema.parse(a));
    return res.json(payload);
  },
);

export const createRefAttachmentById = authHandler(
  paramIdRequestSchema,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const accountId = req.query.accountId;

    const attachment = await Attachment.findById(id);
    if (!attachment) return res.status(404).send();

    if (!attachment.accountId.equals(accountId)) return res.status(403).send();

    const refAttachmentCreate = {
      accountId,
      type: "ref",
      ref: attachment.id,
    };

    const refAttachment = await Attachment.create(refAttachmentCreate);

    const payload = responseSchema.parse(refAttachment);
    return res.status(201).json(payload);
  },
);

export const getAttachmentFileById = authHandler(
  paramIdRequestSchema,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const accountId = req.query.accountId;

    const attachment = await Attachment.findById(id);
    if (!attachment || !attachment.file) return res.status(404).send();

    if (!attachment.accountId.equals(accountId)) return res.status(403).send();

    const fileId = attachment.file.fileId;
    const buffer = await downloadFromGridFS(fileId, "files");
    return res.end(buffer);
  },
);

export const getAttachmentFileThumbnailById = authHandler(
  paramIdRequestSchema,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const accountId = req.query.accountId;

    const attachment = await Attachment.findById(id);
    if (!attachment || !attachment.file || !attachment.file.thumbnail)
      return res.status(404).send();

    if (!attachment.accountId.equals(accountId)) return res.status(403).send();

    const fileId = attachment.file.thumbnail.fileId;
    const buffer = await downloadFromGridFS(fileId, "thumbnails");
    return res.end(buffer);
  },
);
