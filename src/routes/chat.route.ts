import { Router } from "express";
import {
  createChat,
  deleteChat,
  getChatDetails,
  getChatPreviews,
} from "../controllers/chat.controller";

const router = Router();

router.get("/chats/:id", getChatDetails);
router.get("/chats", getChatPreviews);
router.post("/chats", createChat);
router.delete("/chats/:id", deleteChat)

export default router;
