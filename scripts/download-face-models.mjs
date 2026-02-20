#!/usr/bin/env node
/**
 * Download face-api.js models into public/models for face verification.
 * Run once: node scripts/download-face-models.mjs
 * From: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
 */
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "models");
const BASE = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";

const FILES = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model-shard1",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2",
];

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const file of FILES) {
    const url = `${BASE}/${file}`;
    process.stdout.write(`Downloading ${file}... `);
    try {
      const buf = await get(url);
      fs.writeFileSync(path.join(OUT, file), buf);
      console.log("OK");
    } catch (e) {
      console.log("FAIL", e.message);
    }
  }
  console.log("Done. Models are in public/models");
}

main();
