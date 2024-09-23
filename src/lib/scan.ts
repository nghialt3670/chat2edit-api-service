import NodeClam from "clamscan";
import { clamOptions } from "../configs/clamscan";
import { logError } from "../utils/error";

const clamPromise = new NodeClam().init(clamOptions);

export default async function initClam(): Promise<NodeClam> {
  try {
    return await clamPromise;
  } catch (error) {
    throw logError(error);
  }
}
