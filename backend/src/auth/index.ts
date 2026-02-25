import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { generateState, OAuth2RequestError } from "arctic";
import { github, getGitHubUser } from "./github";
import db from "../db";

const STATE_COOKIE = "github_oauth_state";

export const authPlugin = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
      exp: "7d",
    }),
  )

  .get("/github", ({ cookie, redirect }) => {
    const state = generateState();

    const isProd = process.env.NODE_ENV === "production";
    cookie[STATE_COOKIE].set({
      value: state,
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      path: "/",
      maxAge: 60 * 10,
    });

    const url = github.createAuthorizationURL(state, ["user:email"]);

    return redirect(url.toString());
  })

  .get(
    "/callback",
    async ({ query, cookie, jwt: jwtHandler, set, redirect }) => {
      const { code, state } = query;

      const storedState = cookie[STATE_COOKIE].value;

      if (!code || !state || state !== storedState) {
        set.status = 400;
        return { error: "Invalid OAuth state" };
      }

      cookie[STATE_COOKIE].remove();

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
