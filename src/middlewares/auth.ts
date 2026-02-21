import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

export const authMiddleware = new Elysia({ name: "authMiddleware" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
      exp: "7d",
    }),
  )
  .derive({ as: "scoped" }, async ({ jwt: jwtHandler, headers, set }) => {
    const authorization = headers["authorization"];
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;

    if (!token) {
      set.status = 401;
      throw new Error("Missing authorization token");
    }

    const payload = await jwtHandler.verify(token);

    if (!payload || !payload.sub) {
      set.status = 401;
      throw new Error("Invalid or expired token");
    }

    return { userId: payload.sub as string };
  });
