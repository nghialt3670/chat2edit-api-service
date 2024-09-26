import { Router } from "express";
import multer from "multer";
import {
  createFileAttachment,
  createFileAttachments,
  createRefAttachmentById,
  deleteAttachmentById,
  getAttachmentFileById,
  getAttachmentFileThumbnailById,
} from "../controllers/attachment.controller";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/attachments/:id/file", getAttachmentFileById);
router.get("/attachments/:id/file/thumbnail", getAttachmentFileThumbnailById);
router.post("/attachments/files", upload.single("file"), createFileAttachment);
router.post(
  "/attachments/files/batch",
  upload.array("files"),
  createFileAttachments,
);
router.post("/attachments/:id/refs", createRefAttachmentById);
router.delete("/attachments/:id", deleteAttachmentById);

export default router;
