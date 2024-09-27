import { Router } from "express";
import {
  createChat,
  createShareId,
  deleteChat,
  getChatDetails,
  getChatPreviews,
} from "../controllers/chat.controller";

const router = Router();

router.get("/chats/:id", getChatDetails);
router.get("/chats", getChatPreviews);
router.post("/chats", createChat);
router.post("/chats/:id/shareId", createShareId);
router.delete("/chats/:id", deleteChat);
router.delete("/chats/:id/shareId", createShareId);

export default router;
