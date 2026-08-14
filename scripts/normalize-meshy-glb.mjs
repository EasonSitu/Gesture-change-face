import fs from "node:fs";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node scripts/normalize-meshy-glb.mjs <file.glb> [...]");
  process.exit(1);
}

function normalize(filePath) {
  const input = fs.readFileSync(filePath);
  if (input.toString("ascii", 0, 4) !== "glTF" || input.readUInt32LE(4) !== 2) {
    throw new Error(`${filePath} is not a glTF 2 binary file`);
  }

  const chunks = [];
  let json = null;
  let offset = 12;
  while (offset < input.length) {
    const length = input.readUInt32LE(offset);
    const type = input.readUInt32LE(offset + 4);
    const payload = input.subarray(offset + 8, offset + 8 + length);
    if (type === 0x4e4f534a) json = JSON.parse(payload.toString("utf8"));
    chunks.push({ length, type, payload });
    offset += 8 + length;
  }
  if (!json) throw new Error(`${filePath} has no JSON chunk`);

  for (const texture of json.textures || []) {
    const webpSource = texture.extensions?.EXT_texture_webp?.source;
    if (texture.source === undefined && Number.isInteger(webpSource)) {
      texture.source = webpSource;
    }
  }

  const jsonChunk = Buffer.from(JSON.stringify(json), "utf8");
  const paddedJsonLength = Math.ceil(jsonChunk.length / 4) * 4;
  const paddedJson = Buffer.alloc(paddedJsonLength, 0x20);
  jsonChunk.copy(paddedJson);

  const outputChunks = chunks.map((chunk) => {
    const payload = chunk.type === 0x4e4f534a ? paddedJson : chunk.payload;
    const header = Buffer.alloc(8);
    header.writeUInt32LE(payload.length, 0);
    header.writeUInt32LE(chunk.type, 4);
    return Buffer.concat([header, payload]);
  });
  const totalLength = 12 + outputChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const header = Buffer.alloc(12);
  header.write("glTF", 0, "ascii");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);
  fs.writeFileSync(filePath, Buffer.concat([header, ...outputChunks]));
  console.log(`${filePath}: texture sources normalized`);
}

for (const file of files) normalize(file);
