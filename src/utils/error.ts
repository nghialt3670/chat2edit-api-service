import Logger from "../lib/logger";

export function logError(error: unknown) {
  if (error instanceof Error) Logger.error(error.stack);
  else Logger.error("Unknown error: ", error);
  return error;
}
