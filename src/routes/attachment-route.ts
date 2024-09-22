import { Router } from "express";
import multer from "multer";
import {
  createRefs,
  deleteAttachments,
  getAttachments,
  getFile,
  getThumbnail,
  uploadFiles,
} from "../controllers/attachment-controller";
import getFileOrThumbnailSchema from "../schemas/get-file-or-thumbnail-schema";
import validateAndTransform from "../middlewares/validate-and-transform";
import getOrDeleteManySchema from "../schemas/get-or-delete-many-schema";
import uploadFilesSchema from "../schemas/upload-files-schema";
import createRefsSchema from "../schemas/create-refs-schema";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get(
  "/attachments",
  validateAndTransform(getOrDeleteManySchema),
  getAttachments,
);

router.post(
  "/attachments/files",
  upload.array("files"),
  validateAndTransform(uploadFilesSchema),
  uploadFiles,
);

router.post(
  "/attachments/refs",
  validateAndTransform(createRefsSchema),
  createRefs,
);

router.delete(
  "/attachments",
  validateAndTransform(getOrDeleteManySchema),
  deleteAttachments,
);

router.get(
  "/attachment/:id/file",
  validateAndTransform(getFileOrThumbnailSchema),
  getFile,
);

router.get(
  "/attachment/:id/thumbnail",
  validateAndTransform(getFileOrThumbnailSchema),
  getThumbnail,
);

export default router;
