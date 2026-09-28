import mongoose from "mongoose";
import { env } from "./env.js";

const STATE = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export async function connectMongo() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
}

export async function disconnectMongo() {
  await mongoose.disconnect();
}

export async function getMongoHealth() {
  const readyState = mongoose.connection.readyState;
  const status = STATE[readyState] || "unknown";

  if (readyState !== 1 || !mongoose.connection.db) {
    return { ok: false, status };
  }

  try {
    await mongoose.connection.db.admin().command({ ping: 1 });
    return { ok: true, status: "connected" };
  } catch {
    return { ok: false, status: "unreachable" };
  }
}
