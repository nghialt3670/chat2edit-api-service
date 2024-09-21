import { Router } from "express";
import multer from "multer";
import {
  createReferences,
  getFile,
  getThumbnail,
  uploadFiles,
} from "../controllers/attachment-controller";
import createReferencesSchema from "../schemas/create-references-schema";
import getFileOrThumbnailSchema from "../schemas/get-file-schema";
import uploadFilesSchema from "../schemas/upload-files-schema";
import validateRequest from "../middlewares/validate-request";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload-files",
  upload.array("files"),
  validateRequest(uploadFilesSchema),
  uploadFiles,
);

router.post(
  "/create-references",
  validateRequest(createReferencesSchema),
  createReferences,
);

router.get(
  "/thumbnail",
  validateRequest(getFileOrThumbnailSchema),
  getThumbnail,
);

router.get("/file", validateRequest(getFileOrThumbnailSchema), getFile);

export default router;
