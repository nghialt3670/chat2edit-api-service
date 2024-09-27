import { Request, Response } from "express";
import { Readable } from "stream";
import FormData from "form-data";
import AdmZip from "adm-zip";
import mime from "mime";
import messageCreateRequestSchema from "../schemas/request/message-create.request.schema";
import queryChatIdRequestSchema from "../schemas/request/query-chat-id.request.schema";
import messageResponseSchema from "../schemas/response/message.response.schema";
import handler, { authHandler } from "../utils/handler";
import Message, { IMessage } from "../models/message";
import { uploadFile } from "./attachment.controller";
import { downloadFromGridFS } from "../lib/fs";
import Attachment from "../models/attachment";
import Chat from "../models/chat";
import ENV from "../utils/env";

const createMulterFile = (
  buffer: Buffer,
  filename: string,
  contentType: string,
): Express.Multer.File => {
  const fileStream = new Readable();

  return {
    fieldname: "",
    originalname: filename,
    encoding: "",
    mimetype: contentType,
    buffer,
    size: buffer.length,
    stream: fileStream,
    destination: "",
    filename: filename,
    path: "",
  };
};

export const createMessage = authHandler(
  messageCreateRequestSchema,
  async (req: Request, res: Response) => {
    const chatId = req.query.chatId;
    const accountId = req.query.accountId;
    const { text, attachmentIds } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).send();

    if (!chat.accountId.equals(accountId)) return res.status(403).send();

    if (chat.lastMessage && chat.lastMessage.type === "request")
      return res.status(400).send();

    const attachments = await Attachment.find({ _id: { $in: attachmentIds } });

    if (attachments.length !== attachmentIds.length)
      return res.status(404).send();

    const type = "request";
    const message = await Message.create({ chatId, type, text, attachmentIds });

    chat.lastMessage = message;
    await chat.save();

    return res.status(201).send();
  },
);

export const sendMessage = authHandler(
  queryChatIdRequestSchema,
  async (req: Request, res: Response) => {
    const chatId = req.params.chatId;
    const accountId = req.query.accountId;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).send();

    if (!chat.accountId.equals(accountId)) return res.status(403).send();

    const message = chat.lastMessage;
    if (!message || message.type !== "request") return res.status(400).send();

    const { text, attachmentIds } = message;
    const attachments = await Attachment.find({ _id: { $in: attachmentIds } });

    const formData = new FormData();
    await Promise.all(
      attachments.map(async (att) => {
        if (att.type === "file") {
          const { fileId, name, contentType } = att.file!;
          const buffer = await downloadFromGridFS(fileId, "files");
          const filename = `${fileId}.${name}`;
          formData.append("files", buffer, { filename, contentType });
        } else if (att.type === "link") {
          throw new Error("Link attachment not implemented");
        } else if (att.type === "ref") {
          const src = await Attachment.findById(att.ref!);
          if (!src) throw new Error("Source attachment not found");
          const { fileId, name, contentType } = src.file!;
          const emptyBuffer = Buffer.from("");
          const filename = `${fileId}.${name}`;
          formData.append("files", emptyBuffer, { filename, contentType });
        }
      }),
    );

    const base_url = ENV.PROMPT_SERVICE_API_BASE_URL;
    const endpoint = `${base_url}/chats/phases?chatId=${chatId}&text=${text}`;
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData as unknown as BodyInit,
      headers: formData.getHeaders(),
    });

    if (!response.ok) return res.status(500).send();

    const zipped = await response.arrayBuffer();
    const buffer = Buffer.from(zipped);
    const zip = new AdmZip(buffer);
    const unzippedFiles: Express.Multer.File[] = [];

    let textResonse;

    zip.getEntries().forEach((entry) => {
      if (!entry.isDirectory) {
        const filename = entry.entryName;
        const buffer = entry.getData();

        if (filename === "text.txt") {
          textResonse = buffer.toString("utf-8");
        } else {
          const contentType =
            mime.getType(filename) || "application/octet-stream";
          const multerFile = createMulterFile(buffer, filename, contentType);
          unzippedFiles.push(multerFile);
        }
      }
    });

    const uploadPromises = unzippedFiles.map(uploadFile);
    const uploadedFiles = await Promise.all(uploadPromises);
    const attachmentCreates = uploadedFiles.map((file) => ({
      type: "file",
      file,
    }));

    const responseAttachments = await Attachment.insertMany(attachmentCreates);
    const responseAttachmentIds = responseAttachments.map((att) => att.id);
    const responseMesage = await Message.create({
      text: textResonse,
      attachmentIds: responseAttachmentIds,
    });

    return res.json();
  },
);
