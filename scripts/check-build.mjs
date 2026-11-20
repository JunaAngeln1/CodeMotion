import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
const base = process.env.GITHUB_PAGES === "true" ? "/CodeMotion/" : "/";
const html = await readFile(path.join(dist, "index.html"), "utf8");
assert(!html.includes("/@vite/client") && !html.includes("/src/main.tsx"), "El HTML debe ser de producción, no del servidor de desarrollo.");

const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((url) => url.startsWith(base) && !url.startsWith("//"));
assert(references.some((url) => url.startsWith(`${base}assets/`) && url.endsWith(".js")), "Falta el JavaScript de producción.");
for (const reference of references) {
  const file = path.join(dist, decodeURIComponent(reference.slice(base.length).split(/[?#]/)[0]));
  assert((await stat(file)).isFile(), `No existe el recurso del HTML: ${reference}`);
}

const assets = await readdir(path.join(dist, "assets"));
const binaries = assets.filter((name) => name.startsWith("vision_wasm_internal-") && name.endsWith(".wasm"));
assert(binaries.length > 0, "Falta el WASM de MediaPipe en dist/assets.");
assert(assets.some((name) => name.startsWith("vision_wasm_internal-") && name.endsWith(".js")), "Falta el cargador JavaScript del WASM.");
for (const name of binaries) {
  const binary = await readFile(path.join(dist, "assets", name));
  assert(binary.length > 8 && binary.subarray(0, 4).equals(Buffer.from([0, 97, 115, 109])), `WASM inválido: ${name}`);
}

console.log("Build verificado: HTML, recursos estáticos y WASM de MediaPipe presentes.");
