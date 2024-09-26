import streamifier from "streamifier";
import NodeClam from "clamscan";
import { clamOptions } from "../config/clamscan.config";
import { logError } from "../utils/error";

const clamPromise = new NodeClam().init(clamOptions);

export default async function initClam() {
  try {
    return await clamPromise;
  } catch (error) {
    throw logError(error);
  }
}

export async function scanBuffer(buffer: Buffer) {
  const clam = await initClam();
  const stream = streamifier.createReadStream(buffer);
  const { isInfected } = await clam.scanStream(stream);
  return isInfected;
}
