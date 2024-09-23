import { Request, Response } from "express";
import streamifier from "streamifier";
import { ObjectId } from "mongodb";
import AttachmentService from "../services/attachment-service";
import AttachmentMapper from "../mappers/attachment-mapper";
import { logError } from "../utils/error";
import initClam from "../lib/scan";

export default class AttachmentController {
  private service: AttachmentService;

  constructor(service: AttachmentService) {
    this.service = service;
  }

  getById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as unknown as ObjectId;
      const attachment = await this.service.findById(id);
      if (!attachment) return res.status(404).send("Attachment not found");
      const attResponse = AttachmentMapper.toResponse(attachment);
      return res.json(attResponse);
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  };

  getByIds = async (req: Request, res: Response) => {
    try {
      const ids = req.query.ids as unknown as ObjectId[];
      const attachments = await this.service.findByIds(ids);
      const attResponses = attachments.map(AttachmentMapper.toResponse);
      return res.json(attResponses);
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  };

  deleteById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as unknown as ObjectId;
      await this.service.deleteById(id);
      return res.status(204).send();
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  };

  deleteByIds = async (req: Request, res: Response) => {
    try {
      const ids = req.query.ids as unknown as ObjectId[];
      await this.service.deleteByIds(ids);
      return res.status(204).send();
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  };

  uploadFile = async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File;

      const clam = await initClam();
      const fileStream = streamifier.createReadStream(file.buffer);
      const { isInfected } = await clam.scanStream(fileStream);
      if (isInfected) throw new Error(`File infected: ${file.originalname}`);

      const attachment = await this.service.createWithFile(file);
      const attResponse = AttachmentMapper.toResponse(attachment);

      return res.json(attResponse);
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  };

  uploadFiles = async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];

      const clam = await initClam();
      await Promise.all(
        files.map(async (file) => {
          const fileStream = streamifier.createReadStream(file.buffer);
          const { isInfected } = await clam.scanStream(fileStream);
          if (isInfected)
            throw new Error(`File infected: ${file.originalname}`);
        }),
      );

      const attPromises = files.map(this.service.createWithFile);
      const attachments = await Promise.all(attPromises);
      const attResponses = attachments.map(AttachmentMapper.toResponse);

      return res.json(attResponses);
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  };

  createReference = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as unknown as ObjectId;
      const attachment = await this.service.createReference(id);
      if (!attachment)
        return res.status(404).send("Referenced attachment not found");

      const attResponse = AttachmentMapper.toResponse(attachment);
      return res.json(attResponse);
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  };

  getFile = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as unknown as ObjectId;
      const buffer = await this.service.downloadFileBuffer(id);
      if (!buffer) return res.status(404).send("File not found");
      return res.end(buffer);
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  };

  getFileThumbnail = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as unknown as ObjectId;
      const buffer = await this.service.downloadFileThumbnailBuffer(id);
      if (!buffer) return res.status(404).send("File thumbnail not found");
      return res.end(buffer);
    } catch (error) {
      logError(error);
      return res.status(500).send(error);
    }
  };
}
