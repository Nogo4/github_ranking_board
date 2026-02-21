import { Elysia } from "elysia";
import { FLAG_MAP } from "../flags/config";
import db from "../db";

export const rankingPlugin = new Elysia({ prefix: "/ranking" })

  .get("/", async () => {
    const users = await db.user.findMany({
      orderBy: { score: "desc" },
    });

    const flags = await db.achivedFlag.findMany({
      where: { userId: { in: users.map((u) => u.id) } },
      orderBy: { date: "asc" },
    });

    const flagsByUser = new Map<string, typeof flags>();
    for (const f of flags) {
      if (!flagsByUser.has(f.userId)) flagsByUser.set(f.userId, []);
      flagsByUser.get(f.userId)!.push(f);
    }

    return users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      pseudo: user.pseudo,
      score: user.score,
      flagsValidated: (flagsByUser.get(user.id) ?? []).map((af) => ({
        flagId: af.flagId,
        name: FLAG_MAP.get(af.flagId)?.name ?? af.flagId,
        points: FLAG_MAP.get(af.flagId)?.points ?? 0,
        validatedAt: af.date,
      })),
    }));
  })

  .get("/history", async () => {
    const top10 = await db.user.findMany({
      orderBy: { score: "desc" },
      take: 10,
      select: { id: true, pseudo: true },
    });

    const top10Ids = top10.map((u) => u.id);
    const pseudoMap = new Map(top10.map((u) => [u.id, u.pseudo]));

    const validations = await db.achivedFlag.findMany({
      where: { userId: { in: top10Ids } },
      orderBy: { date: "asc" },
    });

    const cumulativeScores: Record<string, number> = {};
    top10Ids.forEach((id) => (cumulativeScores[id] = 0));

    const timeline = validations.map((v) => {
      const flag = FLAG_MAP.get(v.flagId);
      const points = flag?.points ?? 0;
      cumulativeScores[v.userId] = (cumulativeScores[v.userId] ?? 0) + points;

      const snapshot = Object.entries(cumulativeScores)
        .sort(([, a], [, b]) => b - a)
        .map(([userId, score], idx) => ({ rank: idx + 1, userId, score }));

      return {
        date: v.date,
        userId: v.userId,
        pseudo: pseudoMap.get(v.userId) ?? v.userId,
        flagId: v.flagId,
        flagName: flag?.name ?? v.flagId,
        pointsEarned: points,
        rankingSnapshot: snapshot,
      };
    });

    return { timeline };
  });
