import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authPlugin } from "./auth";
import { flagsPlugin } from "./flags";
import { rankingPlugin } from "./ranking";

const app = new Elysia()
  .use(cors())
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
  .get("/", () => ({ message: "GitHub Ranking Board API" }))
  .listen(3000);

console.log(`🦊 Server running at http://localhost:${app.server?.port}`);
