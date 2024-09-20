export function logError(error: unknown) {
  if (error instanceof Error) console.error(error.stack);
  else console.error("Unknown error: ", error);
  return error;
}
