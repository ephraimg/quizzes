// Serves the quiz on localhost and stores progress in progress.json next to this file,
// so progress survives closing the browser and works from any browser.
//
// Usage: node serve.mjs [--open]
// Env:   PORT (default 8765), PROGRESS_FILE (default ./progress.json)

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 8765;
const progressFile = process.env.PROGRESS_FILE || path.join(root, "progress.json");
const MAX_BODY = 1_000_000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".md": "text/markdown; charset=utf-8",
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

function readProgress() {
  try {
    return fs.readFileSync(progressFile, "utf8");
  } catch (e) {
    if (e.code === "ENOENT") return JSON.stringify({ q: {} });
    throw e;
  }
}

function writeProgress(text) {
  // Write to a temp file and rename so a crash never leaves a half-written progress file.
  const tmp = progressFile + ".tmp";
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, progressFile);
}

const server = http.createServer((req, res) => {
  // Reject requests whose Host is not localhost, which blocks DNS-rebinding from other sites.
  const host = (req.headers.host || "").split(":")[0];
  if (host !== "localhost" && host !== "127.0.0.1") return send(res, 403, "Forbidden");

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/progress") {
    try {
      if (req.method === "GET") return send(res, 200, readProgress(), "application/json");
      if (req.method === "PUT") {
        if (!(req.headers["content-type"] || "").startsWith("application/json")) return send(res, 415, "Expected JSON");
        let size = 0;
        const chunks = [];
        req.on("data", (c) => {
          size += c.length;
          if (size > MAX_BODY) {
            send(res, 413, "Too large");
            req.destroy();
          } else chunks.push(c);
        });
        req.on("end", () => {
          if (res.writableEnded) return;
          try {
            const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
            if (!data || typeof data.q !== "object" || Array.isArray(data.q)) return send(res, 400, "Expected { q: {...} }");
            writeProgress(JSON.stringify(data, null, 2) + "\n");
            send(res, 204, "");
          } catch (e) {
            send(res, e instanceof SyntaxError ? 400 : 500, e instanceof SyntaxError ? "Invalid JSON" : "Write failed");
          }
        });
        return;
      }
      return send(res, 405, "Method not allowed");
    } catch (e) {
      return send(res, 500, "Could not read progress file");
    }
  }

  if (req.method !== "GET") return send(res, 405, "Method not allowed");
  const rel = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const file = path.join(root, rel);
  // Serve only the quiz's own files: no path traversal, no progress file, no server code.
  const base = path.basename(file);
  if (!file.startsWith(root + path.sep) || base.startsWith(".") || base === "progress.json" || base === "serve.mjs") return send(res, 404, "Not found");
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, "Not found");
    send(res, 200, buf, TYPES[path.extname(file)] || "application/octet-stream");
  });
});

server.listen(port, "127.0.0.1", () => {
  const url = `http://localhost:${port}/`;
  console.log(`Design Patterns Quiz: ${url}`);
  console.log(`Progress file:        ${progressFile}`);
  if (process.argv.includes("--open")) spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], { stdio: "ignore", detached: true }).unref();
});

server.on("error", (e) => {
  console.error(e.code === "EADDRINUSE" ? `Port ${port} is in use. Try: PORT=8766 node serve.mjs` : e.message);
  process.exit(1);
});
