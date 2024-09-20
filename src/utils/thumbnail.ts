import { Canvas } from "fabric/node";
import { Buffer } from "buffer";
import sharp from "sharp";
import {
  THUMBNAIL_MAX_HEIGHT,
  THUMBNAIL_MAX_WIDTH,
} from "../configs/thumbnail";

export function hasThumbnail(file: Express.Multer.File): boolean {
  return (
    file.mimetype.startsWith("image/") || file.originalname.endsWith(".fabric")
  );
}

interface GeneratedThumbnail {
  buffer: Buffer;
  width: number;
  height: number;
}

export async function generateThumbnail(
  file: Express.Multer.File,
): Promise<GeneratedThumbnail> {
  if (file.mimetype.startsWith("image/")) {
    const buffer = await sharp(file.buffer)
      .resize({
        width: THUMBNAIL_MAX_WIDTH,
        height: THUMBNAIL_MAX_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    const { width, height } = await sharp(buffer).metadata();
    if (!width || !height) throw new Error("Can not read width and height");

    return { buffer, width, height };
  } else if (file.originalname.endsWith(".fabric")) {
    const canvas = new Canvas();
    await canvas.loadFromJSON(file.buffer.toJSON());

    const newWidth = Math.min(canvas.width, THUMBNAIL_MAX_WIDTH);
    const newHeight = Math.min(canvas.height, THUMBNAIL_MAX_HEIGHT);
    canvas.setDimensions({
      width: newWidth,
      height: newHeight,
    });

    const dataURL = canvas.toDataURL({ format: "jpeg", multiplier: 1 });
    const base64 = dataURL.split(",").pop()!;
    return {
      buffer: Buffer.from(base64, "base64"),
      width: newWidth,
      height: newHeight,
    };
  } else {
    throw new Error("Unsupported file type for thumbnail generation");
  }
}
