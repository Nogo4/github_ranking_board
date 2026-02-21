import { Elysia, t } from "elysia";
import { authMiddleware } from "../middlewares/auth";
import { FLAGS, FLAG_MAP } from "./config";
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
    async ({ body: { flagId, flag }, userId, set }) => {
      const config = FLAG_MAP.get(flagId);

      if (!config) {
        set.status = 404;
        return { error: "Flag introuvable" };
      }

      if (flag.trim().toLowerCase() !== config.answer.toLowerCase()) {
        set.status = 400;
        return { error: "Flag incorrect" };
      }

      const already = await db.achivedFlag.findUnique({
        where: { userId_flagId: { userId, flagId: config.id } },
      });

      if (already) {
        set.status = 409;
        return { error: "Flag déjà validé" };
      }

      const [achivedFlag] = await db.$transaction([
        db.achivedFlag.create({
          data: { userId, flagId: config.id },
        }),
        db.user.update({
          where: { id: userId },
          data: { score: { increment: config.points } },
        }),
      ]);

      return {
        message: `Flag "${config.name}" validé ! +${config.points} points`,
        flagId: config.id,
        flagName: config.name,
        pointsEarned: config.points,
        validatedAt: achivedFlag.date,
      };
    },
    {
      body: t.Object({ flagId: t.String(), flag: t.String() }),
    },
  );
