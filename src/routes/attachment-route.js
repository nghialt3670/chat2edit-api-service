"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const attachment_controller_1 = require("../controllers/attachment-controller");
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
router.post("/upload-files", upload.array("files"), attachment_controller_1.uploadFileAttachments);
router.post("/create-references", attachment_controller_1.createReferenceAttachments);
router.get("/thumbnail", attachment_controller_1.getThumbnail);
router.get("/file", attachment_controller_1.getFile);
exports.default = router;
