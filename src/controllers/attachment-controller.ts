import { Request, Response } from "express";
import streamifier from "streamifier";
import createReferenceAttachment, {
  findAttachmentById,
  uploadFileAttachment,
} from "../services/attachment-service";
import { downloadFromGridFS } from "../lib/db";
import Attachment from "../models/attachment";
import { logError } from "../utils/error";
import initClam from "../lib/scan";

export async function uploadFileAttachments(
  request: Request,
  response: Response,
) {
  try {
    const files = request.files as Express.Multer.File[];

    if (!files || files.length === 0)
      return response.status(400).send("No file uploaded");

    // Virus scanning
    const clam = await initClam();
    await Promise.all(
      files.map(async (file) => {
        const fileStream = streamifier.createReadStream(file.buffer);
        const { isInfected } = await clam.scanStream(fileStream);
        if (isInfected)
          response.status(500).send(`File infected: ${file.originalname}`);
      }),
    );

    // Attachment uploading
    const attachmentIds = await Promise.all(
      files.map(async (file) => await uploadFileAttachment(file)),
    );

    response.status(200).send(attachmentIds);
  } catch (error) {
    logError(error);
    response
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function createReferenceAttachments(
  request: Request,
  response: Response,
) {
  try {
    const { referencedIds } = request.body;

    if (!referencedIds || referencedIds.length === 0)
      return response.status(400).send("No ref ID provided");

    // Reference creating
    const referenceIds = await Promise.all(
      referencedIds.map(
        async (id: string) => await createReferenceAttachment(id),
      ),
    );

    response.status(200).send(referenceIds);
  } catch (error) {
    logError(error);
    response
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function getFile(request: Request, response: Response) {
  try {
    const { attachmentId } = request.query;

    const attachment = (await findAttachmentById(
      attachmentId as string,
    )) as unknown as Attachment;
    if (!attachment) return response.status(400).send("Attachment not found");
    if (!attachment.file)
      return response.status(400).send("Attachment file not found");

    const fileId = attachment.file!.gridId;
    const buffer = await downloadFromGridFS(fileId, "files");

    response.end(buffer);
  } catch (error) {
    logError(error);
    response
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function getThumbnail(request: Request, response: Response) {
  try {
    const { attachmentId } = request.query;

    const attachment = (await findAttachmentById(
      attachmentId as string,
    )) as unknown as Attachment;
    if (!attachment)
      return response.status(400).send("Attachment file not found");
    if (!attachment.file)
      return response.status(400).send("Attachment file not found");
    if (!attachment.file.thumbnail)
      return response.status(400).send("Attachment file thumbnail not found");

    const thumbnailId = attachment.file!.thumbnail!.gridId;
    const buffer = await downloadFromGridFS(thumbnailId, "thumbnails");

    response.end(buffer);
  } catch (error) {
    logError(error);
    response
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
}
