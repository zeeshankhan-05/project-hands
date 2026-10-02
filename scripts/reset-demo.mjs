import { rm } from "node:fs/promises";
import path from "node:path";

const demoFile = path.join(process.cwd(), ".data", "sessions.json");
await rm(demoFile, { force: true });
console.log("Local demo sessions reset. Seed data is unchanged.");
