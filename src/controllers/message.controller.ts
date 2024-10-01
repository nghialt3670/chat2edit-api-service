import { Request, Response } from "express";
import { lookup } from "mime-types";
import { Readable } from "stream";
import messageCreateRequestSchema from "../schemas/request/message-create.request.schema";
import queryChatIdRequestSchema from "../schemas/request/query-chat-id.request.schema";
import messageResponseSchema from "../schemas/response/message.response.schema";
import { uploadFile } from "./attachment.controller";
import { authHandler } from "../utils/handler";
import { downloadFromGridFS } from "../lib/fs";
import Attachment from "../models/attachment";
import Message from "../models/message";
import Chat from "../models/chat";
import ENV from "../utils/env";
import JSZip from "jszip";

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
    const message = await Message.create({ chatId, type, text, attachments: attachmentIds });

    chat.lastMessage = message;
    chat.title = text;
    await chat.save();

    return res.status(201).send();
  },
);

export const sendMessage = authHandler(
  queryChatIdRequestSchema,
  async (req: Request, res: Response) => {
    const chatId = req.query.chatId;
    const accountId = req.query.accountId;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).send();

    if (!chat.accountId.equals(accountId)) return res.status(403).send();

    let message = chat.lastMessage;
    if (!message || message.type !== 'request') return res.status(400).send();

    let attachments = await Attachment.find({ _id: { $in: message.attachments } });

    const formData = new FormData();
    formData.set('text', message.text);
    formData.set('provider', chat.settings.provider);
    formData.set('language', chat.settings.language);

    await Promise.all(
      attachments.map(async (att) => {
        if (att.type === 'file') {
          const { fileId, name, contentType } = att.file!;
          const buffer = await downloadFromGridFS(fileId, 'files');
          const blob = new Blob([buffer], { type: contentType });
          formData.append('files', blob, `${fileId}.${name}`);
        } else if (att.type === 'link') {
          throw new Error('Link attachment not implemented');
        } else if (att.type === 'ref') {
          const src = await Attachment.findById(att.ref!);
          if (!src) throw new Error('Source attachment not found');
          const emptyBuffer = Buffer.from('');
          const emptyBlob = new Blob([emptyBuffer], { type: 'application/octet-stream' });
          formData.append('files', emptyBlob, `${src.file!.fileId}.${src.file!.name}`);
        }
      })
    );

    const base_url = ENV.PROMPT_SERVICE_API_BASE_URL;
    const endpoint = `${base_url}/api/phases?chat_id=${chatId}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData as unknown as BodyInit
    });

    if (!response.ok) return res.status(500).send();

    const zipped = await response.arrayBuffer();
    const buffer = Buffer.from(zipped);
    const unzippedFiles: Express.Multer.File[] = [];
    let text: string | undefined;

    const zip = new JSZip();
    const unzipped = await zip.loadAsync(buffer);

    for (const filename of Object.keys(unzipped.files)) {
      const file = unzipped.files[filename];
      if (file.dir) continue;

      const content = await file.async('nodebuffer'); 

      if (filename === 'text.txt') {
        text = content.toString('utf-8');
      } else {
        const contentType = lookup(filename) || 'application/octet-stream';
        const multerFile = createMulterFile(content, filename, contentType);
        unzippedFiles.push(multerFile);
      }
    }
  
    const uploadPromises = unzippedFiles.map(uploadFile);
    const uploadedFiles = await Promise.all(uploadPromises);
    const attachmentCreates = uploadedFiles.map((file) => ({
      type: 'file',
      file
    }));

    const type = "response"
    attachments = await Attachment.insertMany(attachmentCreates);
    const attachmentIds = attachments.map((att) => att.id);
    message = await Message.create({ chatId, type, text, attachments: attachmentIds });

    chat.lastMessage = message;
    chat.title = text;
    await chat.save();

    const payload = messageResponseSchema.parse(message);
    return res.json(payload);
  }
);
