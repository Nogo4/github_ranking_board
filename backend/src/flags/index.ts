import { Elysia, t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { FLAGS, FLAG_MAP, FLAG_BY_ANSWER } from "./config";
import db from "../db";

export const flagsPlugin = new Elysia({ prefix: "/flags" })
  .use(authMiddleware)

  .get("/", async ({ userId }) => {
    const validated = await db.achivedFlag.findMany({
      where: { userId },
      select: { flagId: true, date: true },
    });

    const validatedMap = new Map(validated.map((v) => [v.flagId, v.date]));

    return FLAGS.map((flag) => ({
      id: flag.id,
      name: flag.name,
      description: flag.description,
      points: flag.points,
      repoUrl: flag.repoUrl,
      validated: validatedMap.has(flag.id),
      validatedAt: validatedMap.get(flag.id) ?? null,
    }));
  })

  .post(
    "/submit",
    async ({ body: { flag }, userId, set }) => {
      const match = FLAG_BY_ANSWER.get(flag.trim().toLowerCase());

      if (!match) {
        set.status = 400;
        return { error: "Flag incorrect" };
      }

      const already = await db.achivedFlag.findUnique({
        where: { userId_flagId: { userId, flagId: match.id } },
      });

      if (already) {
        set.status = 409;
        return { error: "Flag déjà validé" };
      }

      const [achivedFlag] = await db.$transaction([
        db.achivedFlag.create({
          data: { userId, flagId: match.id },
        }),
        db.user.update({
          where: { id: userId },
          data: { score: { increment: match.points } },
        }),
      ]);

      return {
        message: `Flag "${match.name}" validé ! +${match.points} points`,
        flagId: match.id,
        flagName: match.name,
        pointsEarned: match.points,
        validatedAt: achivedFlag.date,
      };
    },
    {
      body: t.Object({ flag: t.String() }),
    },
  );
