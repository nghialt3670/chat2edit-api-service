import { ObjectId } from "mongodb";

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

export function toObjectIds(ids: string[]): ObjectId[] {
  return ids.map(toObjectId);
}
