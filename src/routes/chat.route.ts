import { Router } from "express";
import {
  getChatDetails,
  getChatPreviews,
} from "../controllers/chat.controller";

const router = Router();

router.get("/chats/:id", getChatDetails);
router.get("/chats", getChatPreviews);

export default router;
