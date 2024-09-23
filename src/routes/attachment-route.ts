import { Router } from "express";
import multer from "multer";

import { Collection } from "mongodb";
import uploadMultipleFilesSchema from "../schemas/upload-multiple-files-schema";
import singleActionByIdSchema from "../schemas/single-action-by-id-schema";
import uploadSingleFileSchema from "../schemas/upload-single-file-schema";
import bulkActionByIdsSchema from "../schemas/bulk-action-by-ids-schema";
import AttachmentController from "../controllers/attachment-controller";
import AttachmentService from "../services/attachment-service";
import transform from "../middlewares/transform";
import Attachment from "../models/attachment";
import { logError } from "../utils/error";
import { getCollection } from "../lib/db";

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
    transform(singleActionByIdSchema),
    controller.getById,
  );

  router.delete(
    "/attachments/:id",
    transform(singleActionByIdSchema),
    controller.deleteById,
  );

  router.get(
    "/attachments/:id/file",
    transform(singleActionByIdSchema),
    controller.getFile,
  );

  router.get(
    "/attachments/:id/file/thumbnail",
    transform(singleActionByIdSchema),
    controller.getFileThumbnail,
  );

  router.post(
    "/attachments/:id/references",
    transform(singleActionByIdSchema),
    controller.createReference,
  );

  router.get(
    "/attachments",
    transform(bulkActionByIdsSchema),
    controller.getByIds,
  );

  router.delete(
    "/attachments",
    transform(bulkActionByIdsSchema),
    controller.deleteByIds,
  );

  router.post(
    "/attachments/files",
    upload.single("file"),
    transform(uploadSingleFileSchema),
    controller.uploadFile,
  );

  router.post(
    "/attachments/files/batch",
    upload.array("files"),
    transform(uploadMultipleFilesSchema),
    controller.uploadFiles,
  );
}

initRoutes().catch(logError);

export default router;
