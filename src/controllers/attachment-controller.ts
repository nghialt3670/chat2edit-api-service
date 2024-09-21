import { Request, Response } from "express";
import streamifier from "streamifier";
import createReference, {
  deleteByIds,
  downloadFileById,
  downloadThumbnailById,
  uploadFile,
} from "../services/attachment-service";
import { logError } from "../utils/error";
import initClam from "../lib/clamscan";

export async function uploadFiles(request: Request, response: Response) {
  try {
    const files = request.files as Express.Multer.File[];

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

    const attachments = await Promise.all(files.map(uploadFile));
    response.status(200).send(attachments);
  } catch (error) {
    logError(error);
    response
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function createReferences(request: Request, response: Response) {
  try {
    const referencedIds = request.body.referencedIds as string[];
    const attachments = await Promise.all(referencedIds.map(createReference));
    response.status(200).send(attachments);
  } catch (error) {
    logError(error);
    response
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function getFile(request: Request, response: Response) {
  try {
    const attachmentId = request.query.attachmentId as string;
    const buffer = await downloadFileById(attachmentId);
    if (!buffer) response.status(400).send("File not found");
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
    const attachmentId = request.query.attachmentId as string;
    const buffer = await downloadThumbnailById(attachmentId);
    if (!buffer) response.status(400).send("Thumbnail not found");
    response.end(buffer);
  } catch (error) {
    logError(error);
    response
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function deleteAttachments(request: Request, response: Response) {
  try {
    const attachmentIds = request.body.attachmentIds as string[];
    await deleteByIds(attachmentIds);
    response.status(204).send();
  } catch (error) {
    logError(error);
    response
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
}
