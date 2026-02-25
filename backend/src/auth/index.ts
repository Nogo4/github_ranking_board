import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { generateState, OAuth2RequestError } from "arctic";
import { github, getGitHubUser } from "./github";
import db from "../db";

const pendingStates = new Map<string, number>();
const STATE_TTL = 10 * 60 * 1000; // 10 minutes

setInterval(() => {
  const now = Date.now();
  for (const [state, createdAt] of pendingStates) {
    if (now - createdAt > STATE_TTL) pendingStates.delete(state);
  }
}, 5 * 60 * 1000);

export const authPlugin = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
      exp: "7d",
    }),
  )

  .get("/github", ({ redirect }) => {
    const state = generateState();
    pendingStates.set(state, Date.now());

    const url = github.createAuthorizationURL(state, ["user:email"]);

    return redirect(url.toString());
  })

  .get(
    "/callback",
    async ({ query, jwt: jwtHandler, set, redirect }) => {
      const { code, state } = query;

      const createdAt = pendingStates.get(state);
      if (!code || !state || createdAt === undefined) {
        set.status = 400;
        return { error: "Invalid OAuth state" };
      }

      pendingStates.delete(state);
      if (Date.now() - createdAt > STATE_TTL) {
        set.status = 400;
        return { error: "OAuth state expired" };
      }

      let accessToken: string;
      try {
        const tokens = await github.validateAuthorizationCode(code);
        accessToken = tokens.accessToken();
      } catch (e) {
        if (e instanceof OAuth2RequestError) {
          set.status = 400;
          return { error: "Invalid authorization code" };
        }
        set.status = 500;
        return { error: "OAuth token exchange failed" };
      }

      let pseudo: string;
      let email: string;
      try {
        ({ pseudo, email } = await getGitHubUser(accessToken));
      } catch (e) {
        set.status = 500;
        return { error: (e as Error).message };
      }

      const user = await db.user.upsert({
        where: { email },
        create: { pseudo, email },
        update: { pseudo },
      });

      const token = await jwtHandler.sign({
        sub: user.id,
        pseudo: user.pseudo,
        email: user.email,
      });

      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";
      const params = new URLSearchParams({
        token,
        user: JSON.stringify(user),
      });

      return redirect(`${frontendUrl}/callback?${params.toString()}`);
    },
    {
      query: t.Object({
        code: t.String(),
        state: t.String(),
      }),
    },
  );
