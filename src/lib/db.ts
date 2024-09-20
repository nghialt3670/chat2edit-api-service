import { GridFSBucket, ObjectId } from "mongodb";
import { MongoClient } from "mongodb";
import { logError } from "../utils/error";

let client: MongoClient | undefined;

export async function initClient(): Promise<MongoClient> {
  if (client) return client;

  try {
    client = await new MongoClient(process.env.MONGO_URI!).connect();
    return client;
  } catch (error) {
    throw error;
  }
}

export async function getBucket(name: string) {
  const client = await initClient();
  return new GridFSBucket(client.db(), { bucketName: name });
}

export async function getCollection(name: string) {
  const client = await initClient();
  return client.db().collection(name);
}

export async function uploadToGridFS(
  buffer: Buffer,
  filename: string,
  contentType: string,
  bucketName: string,
): Promise<ObjectId> {
  const bucket = await getBucket(bucketName);
  return new Promise((resolve) => {
    const writeStream = bucket.openUploadStream(filename, { contentType });
    writeStream.end(buffer);
    writeStream.on("finish", () => resolve(writeStream.id));
    writeStream.on("error", (error) => {
      logError(error);
      throw error;
    });
  });
}

export async function downloadFromGridFS(
  fileId: ObjectId,
  bucketName: string,
): Promise<Buffer> {
  const bucket = await getBucket(bucketName);
  return new Promise((resolve) => {
    const readStream = bucket.openDownloadStream(fileId);

    let data: Buffer[] = [];
    readStream.on("data", (chunk) => data.push(chunk));
    readStream.on("end", () => resolve(Buffer.concat(data)));
    readStream.on("error", (error) => {
      throw logError(error);
    });
  });
}
