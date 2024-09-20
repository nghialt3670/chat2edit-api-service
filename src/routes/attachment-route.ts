import { Router } from "express";
import multer from "multer";
import {
  createReferenceAttachments,
  getFile,
  getThumbnail,
  uploadFileAttachments,
} from "../controllers/attachment-controller";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-files", upload.array("files"), uploadFileAttachments);
router.post("/create-references", createReferenceAttachments);
router.get("/thumbnail", getThumbnail);
router.get("/file", getFile);

export default router;
