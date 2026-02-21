import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authPlugin } from "./auth";

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
  .get("/", () => ({ message: "GitHub Ranking Board API" }))
  .listen(3000);

console.log(`🦊 Server running at http://localhost:${app.server?.port}`);
