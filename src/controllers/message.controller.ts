import { Request, Response } from "express";
import concat from "concat-stream";
import { Readable } from "stream";
import FormData from "form-data";
import yauzl from "yauzl";
import mime from "mime";
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
    const chatId = req.query.chatId;
    const accountId = req.query.accountId;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).send();

    if (!chat.accountId.equals(accountId)) return res.status(403).send();

    let message = chat.lastMessage;
    if (!message || message.type !== "request") return res.status(400).send();

    let { attachmentIds } = message;
    let attachments = await Attachment.find({ _id: { $in: attachmentIds } });

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
    const endpoint = `${base_url}/chats/phases?chatId=${chatId}&text=${message.text}`;
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData as unknown as BodyInit,
      headers: formData.getHeaders(),
    });

    if (!response.ok) return res.status(500).send();

    const zipped = await response.arrayBuffer();
    const buffer = Buffer.from(zipped);
    const unzippedFiles: Express.Multer.File[] = [];
    let text;

    yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipFile) => {
      if (err) throw err;

      zipFile.readEntry();

      zipFile.on("entry", (entry) => {
        if (!entry.fileName.endsWith("/")) {
          zipFile.openReadStream(entry, (err, readStream) => {
            if (err) throw err;

            readStream.pipe(
              concat((buffer) => {
                const filename = entry.fileName;

                if (filename === "text.txt") {
                  text = buffer.toString("utf-8");
                } else {
                  const contentType =
                    mime.getType(filename) || "application/octet-stream";
                  const multerFile = createMulterFile(
                    buffer,
                    filename,
                    contentType,
                  );
                  unzippedFiles.push(multerFile);
                }

                zipFile.readEntry(); // Continue reading the next entry
              }),
            );
          });
        } else {
          zipFile.readEntry(); // Skip directories
        }
      });
    });

    const uploadPromises = unzippedFiles.map(uploadFile);
    const uploadedFiles = await Promise.all(uploadPromises);
    const attachmentCreates = uploadedFiles.map((file) => ({
      type: "file",
      file,
    }));

    attachments = await Attachment.insertMany(attachmentCreates);
    attachmentIds = attachments.map((att) => att.id);
    message = await Message.create({ text, attachmentIds });

    const payload = messageResponseSchema.parse(message);
    return res.json(payload);
  },
);
