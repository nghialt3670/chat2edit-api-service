import { Router } from "express";
import multer from "multer";

import { Collection } from "mongodb";
import uploadMultipleFilesSchema from "../schemas/upload-multiple-files-schema";
import singleActionByIdSchema from "../schemas/single-action-by-id-schema";
import uploadSingleFileSchema from "../schemas/upload-single-file-schema";
import validateAndTransform from "../middlewares/validate-and-transform";
import bulkActionByIdsSchema from "../schemas/bulk-action-by-ids-schema";
import AttachmentController from "../controllers/attachment-controller";
import AttachmentService from "../services/attachment-service";
import { getCollection } from "../lib/mongodb";
import Attachment from "../models/attachment";
import { logError } from "../utils/error";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

async function initRoutes() {
  const collection = (await getCollection(
    "attachments",
  )) as unknown as Collection<Attachment>;
  const service = new AttachmentService(collection);
  const controller = new AttachmentController(service);

  router.get(
    "/attachments/:id",
    validateAndTransform(singleActionByIdSchema),
    controller.getById,
  );

  router.delete(
    "/attachments/:id",
    validateAndTransform(singleActionByIdSchema),
    controller.deleteById,
  );

  router.get(
    "/attachments/:id/file",
    validateAndTransform(singleActionByIdSchema),
    controller.getFile,
  );

  router.get(
    "/attachments/:id/file/thumbnail",
    validateAndTransform(singleActionByIdSchema),
    controller.getFileThumbnail,
  );

  router.post(
    "/attachments/:id/references",
    validateAndTransform(singleActionByIdSchema),
    controller.createReference,
  );

  router.get(
    "/attachments",
    validateAndTransform(bulkActionByIdsSchema),
    controller.getByIds,
  );

  router.delete(
    "/attachments",
    validateAndTransform(bulkActionByIdsSchema),
    controller.deleteByIds,
  );

  router.post(
    "/attachments/files",
    upload.single("file"),
    validateAndTransform(uploadSingleFileSchema),
    controller.uploadFile,
  );

  router.post(
    "/attachments/files/batch",
    upload.array("files"),
    validateAndTransform(uploadMultipleFilesSchema),
    controller.uploadFiles,
  );
}

initRoutes().catch(logError);

export default router;
