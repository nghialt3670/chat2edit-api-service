import { Router } from "express";
import { createMessage, sendMessage } from "../controllers/message.controller";

const router = Router();

router.post("/messages", createMessage);
router.post("/messages/send", sendMessage);

export default router;
