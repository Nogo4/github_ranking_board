import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { authPlugin } from "./auth";
import { flagsPlugin } from "./flags";
import { rankingPlugin } from "./ranking";
import { existsSync } from "fs";
import { join } from "path";

const DIST_DIR = join(import.meta.dir, "../../frontend/dist");
const serveFrontend = existsSync(DIST_DIR);

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
      credentials: true,
    }),
  )
  .use(
    swagger({
      documentation: {
        info: {
          title: "GitHub Ranking Board API",
          version: "1.0.0",
        },
      },
    }),
  )
  .use(authPlugin)
  .use(flagsPlugin)
  .use(rankingPlugin)
  .get("/api/health", () => ({ message: "GitHub Ranking Board API" }));

// In production, serve the built frontend and handle SPA fallback
if (serveFrontend) {
  console.log(`📁 Serving frontend from ${DIST_DIR}`);
  app.use(
    staticPlugin({
      assets: DIST_DIR,
      prefix: "/",
      alwaysStatic: false,
    }),
  )
  .onError(({ set }) => {
    // SPA fallback: for any unmatched route, serve index.html
    set.headers["content-type"] = "text/html";
    return Bun.file(join(DIST_DIR, "index.html"));
  });
}

app.listen(3000);

console.log(
  `🦊 Server running at http://localhost:${app.server?.port}${serveFrontend ? " (serving frontend)" : ""}`,
);
