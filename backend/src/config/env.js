import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  port: Number(process.env.PORT || 3000),
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amroh",
  appApiKey: process.env.APP_API_KEY || "",
  adminApiKey: process.env.ADMIN_API_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "*",
};
