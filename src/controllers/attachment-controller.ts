import { Request, Response } from "express";
import streamifier from "streamifier";
import { ObjectId } from "mongodb";
import {
  createRef,
  deleteByIds,
  downloadFileById,
  downloadThumbnailById,
  findByIds,
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

export async function createRefs(request: Request, response: Response) {
  try {
    const ids = request.body.ids as unknown as ObjectId[];
    const attachments = await Promise.all(ids.map(createRef));
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
    const id = request.params.id as unknown as ObjectId;
    const buffer = await downloadFileById(id);
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
    const id = request.params.id as unknown as ObjectId;
    const buffer = await downloadThumbnailById(id);
    if (!buffer) response.status(400).send("Thumbnail not found");
    response.end(buffer);
  } catch (error) {
    logError(error);
    response
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function getAttachments(request: Request, response: Response) {
  try {
    const ids = request.query.ids as unknown as ObjectId[];
    const attachments = await findByIds(ids);
    response.status(200).send(attachments);
  } catch (error) {
    logError(error);
    response
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function deleteAttachments(request: Request, response: Response) {
  try {
    const ids = request.query.ids as unknown as ObjectId[];
    await deleteByIds(ids);
    response.status(204).send();
  } catch (error) {
    logError(error);
    response
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
}
