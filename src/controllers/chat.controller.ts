import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { z } from "zod";
import chatDetailsResponseSchema from "../schemas/response/chat-details.response.schema";
import chatPreviewResponseSchema from "../schemas/response/chat-preview.response.schema";
import chatCreateRequestSchema from "../schemas/request/chat-create.request.schema";
import paramIdRequestSchema from "../schemas/request/param-id.request.schema";
import { authHandler } from "../utils/handler";
import Message from "../models/message";
import Chat from "../models/chat";
import ENV from "../utils/env";

const emptySchema = z.object({});

export const getChatPreviews = authHandler(
  emptySchema,
  async (req: Request, res: Response) => {
    const accountId = req.query.accountId;
    const chats = await Chat.find({ accountId }).sort({ updatedAt: -1 });
    const payload = z.array(chatPreviewResponseSchema).parse(chats);
    return res.json(payload);
  },
);

export const getChatDetails = authHandler(
  paramIdRequestSchema,
  async (req: Request, res: Response) => {
    const chatId = req.params.id;
    const accountId = req.query.accountId;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).send();

    if (!chat.accountId.equals(accountId)) return res.status(403).send();

    chat.messages = await Message.find({ chatId }).populate("attachments");

    const payload = chatDetailsResponseSchema.parse(chat);
    return res.json(payload);
  },
);

export const createChat = authHandler(
  chatCreateRequestSchema,
  async (req: Request, res: Response) => {
    const chatCreate = req.body;
    const accountId = req.query.accountId;

    const newChat = await Chat.create({ accountId, ...chatCreate });
    const body = JSON.stringify({ chat_id: newChat._id });
    const endpoint = `${ENV.PROMPT_SERVICE_API_BASE_URL}/api/chats`;
    const headers = { "Content-Type": "application/json" };
    const response = await fetch(endpoint, { method: "POST", headers, body });

    if (!response.ok) {
      await Chat.deleteOne({ _id: newChat._id });
      throw new Error();
    }

    return res.status(201).json(newChat._id);
  },
);

export const deleteChat = authHandler(
  paramIdRequestSchema,
  async (req: Request, res: Response) => {
    const chatId = req.params.id;
    const accountId = req.query.accountId;

    const chat = await Chat.findById(chatId);

    if (!chat) return res.status(404).send();
    if (!chat.accountId.equals(accountId)) return res.status(403).send();

    await Chat.findByIdAndDelete(chatId);

    Message.deleteMany({ chatId });

    //Implement attachments delete

    return res.status(204).send();
  },
);

export const createShareId = authHandler(
  paramIdRequestSchema,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const accountId = req.query.accountId;

    const chat = await Chat.findById(id);

    if (!chat) return res.status(404).send();
    if (!chat.accountId.equals(accountId)) return res.status(403).send();

    chat.shareId = new ObjectId();
    await chat.save();

    return res.status(201).json(chat.shareId);
  },
);

export const deleteShareId = authHandler(
  paramIdRequestSchema,
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const accountId = req.query.accountId;

    const chat = await Chat.findById(id);

    if (!chat) return res.status(404).send();
    if (!chat.accountId.equals(accountId)) return res.status(403).send();

    chat.shareId = null;
    await chat.save();

    return res.status(204).json(chat.shareId);
  },
);
