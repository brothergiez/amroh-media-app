import { connectMongo, disconnectMongo } from "../src/config/mongodb.js";
import { env } from "../src/config/env.js";
import { seedFromContents } from "../src/services/seedService.js";

async function main() {
  if (!env.appApiKey || !env.adminApiKey) {
    throw new Error("APP_API_KEY and ADMIN_API_KEY must be set in backend/.env");
  }

  await connectMongo();
  const result = await seedFromContents({ reset: true });
  console.log(
    `Seed complete. imported=${result.imported} skipped=${result.skipped} version=${result.version}`,
  );
  await disconnectMongo();
}

main().catch((err) => {
  console.error("Seed failed", err);
  process.exit(1);
});
