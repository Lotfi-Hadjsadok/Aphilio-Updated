import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");

function mergeMissing(target, source) {
  if (typeof source !== "object" || source === null || Array.isArray(source)) {
    return;
  }
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key])
    ) {
      if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) {
        target[key] = {};
      }
      mergeMissing(target[key], source[key]);
    } else if (target[key] === undefined) {
      target[key] = source[key];
    }
  }
}

const englishPath = path.join(messagesDir, "en.json");
const english = JSON.parse(fs.readFileSync(englishPath, "utf8"));

for (const name of fs.readdirSync(messagesDir)) {
  if (!name.endsWith(".json") || name === "en.json") continue;
  const filePath = path.join(messagesDir, name);
  const locale = JSON.parse(fs.readFileSync(filePath, "utf8"));
  mergeMissing(locale, english);
  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`);
}
