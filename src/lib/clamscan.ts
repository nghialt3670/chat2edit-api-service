import NodeClam from "clamscan";
import { logError } from "../utils/error";
import { clamOptions } from "../configs/clamscan";

const clamPromise = new NodeClam().init(clamOptions);

export default async function initClam(): Promise<NodeClam> {
  try {
    return await clamPromise;
  } catch (error) {
    throw logError(error);
  }
}
