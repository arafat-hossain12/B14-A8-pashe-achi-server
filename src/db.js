import { MongoClient } from "mongodb";

let client;
let db;

export async function connectDB() {
  if (db) return db;
  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db(process.env.MONGODB_DB || "pasheachi");
  await db.collection("joins").createIndex({ eventId: 1, userEmail: 1 }, { unique: true });
  await db.collection("events").createIndex({ eventDate: 1 });
  return db;
}

export const events = () => db.collection("events");
export const joins = () => db.collection("joins");
