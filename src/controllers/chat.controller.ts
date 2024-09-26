import { Request, Response } from "express";
import { z } from "zod";
import chatDetailsResponseSchema from "../schemas/response/chat-details.response.schema";
import chatPreviewResponseSchema from "../schemas/response/chat-preview.response.schema";
import messageResponseSchema from "../schemas/response/message.response.schema";
import paramIdRequestSchema from "../schemas/request/param-id.request.schema";
import { authHandler } from "../utils/handler";
import Chat, { IChat } from "../models/chat";
import Account from "../models/account";
import Message from "../models/message";

const emptySchema = z.object({});

export const getChatPreviews = authHandler(
  emptySchema,
  async (req: Request, res: Response) => {
    const accountId = req.query.accountId;
    const chats = await Chat.find({ accountId });
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
    if (!chat) res.status(404).send();

    if (!chat.accountId.equals(accountId)) 
      return res.status(403).send();

    chat.messages = await Message.find({ chatId });

    const payload = chatDetailsResponseSchema.parse(chat);
    return res.json(payload);
  },
);
