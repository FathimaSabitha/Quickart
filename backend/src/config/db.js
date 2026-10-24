
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

export async function connectDB() {
  await client.connect();
  db = client.db();
  console.log("MongoDB Connected");
}

export function getDB() {
  if (!db) {
    throw new Error("Database is not connected");
  }

  return db;
}
