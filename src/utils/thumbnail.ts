import { Canvas } from "fabric/node";
import sharp, { Sharp } from "sharp";
import { Buffer } from "buffer";
import {
  THUMBNAIL_MAX_HEIGHT,
  THUMBNAIL_MAX_WIDTH,
} from "../config/thumbnail.config";

export function hasThumbnail(file: Express.Multer.File): boolean {
  return (
    file.mimetype.startsWith("image/") || file.originalname.endsWith(".fabric")
  );
}

export async function hasTransparency(image: Sharp): Promise<boolean> {
  const { data } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return data.some((value, index) => index % 4 === 3 && value < 255);
}

export async function getImageBuffer(file: Express.Multer.File) {
  if (file.mimetype.startsWith("image/")) {
    return file.buffer;
  } else if (file.originalname.endsWith(".fabric")) {
    const canvas = new Canvas();
    await canvas.loadFromJSON(file.buffer.toJSON());
    const base64 = canvas.toDataURL().split(",").pop()!;
    return Buffer.from(base64, "base64");
  } else {
    throw new Error("Unsupported file type for thumbnail generation");
  }
}

interface CreateThumbnailReturn {
  buffer: Buffer;
  width: number;
  height: number;
  format: "jpeg" | "png";
}

export async function createThumbnail(
  file: Express.Multer.File,
): Promise<CreateThumbnailReturn> {
  const imageBuffer = await getImageBuffer(file);

  const thumbnail = sharp(imageBuffer).resize({
    width: THUMBNAIL_MAX_WIDTH,
    height: THUMBNAIL_MAX_HEIGHT,
    fit: "inside",
    withoutEnlargement: true,
  });

  const { width, height, channels } = await thumbnail.metadata();
  if (!width || !height) throw new Error("Failed to extract thumbnail size");

  const format =
    channels === 4
      ? (await hasTransparency(thumbnail))
        ? "png"
        : "jpeg"
      : "jpeg";

  const buffer =
    format === "png"
      ? await thumbnail.png().toBuffer()
      : await thumbnail.jpeg().toBuffer();

  return { buffer, width, height, format };
}
