import { env } from "./config/env.js";
import { connectMongo } from "./config/mongodb.js";
import { createApp } from "./app.js";

async function main() {
  await connectMongo();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Majelis Ta'lim Al-Munawwaroh API listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start API", err);
  process.exit(1);
});
