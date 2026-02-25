import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client.ts";

const dbUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

const adapter = new PrismaLibSql({
  url: dbUrl,
});

const db = new PrismaClient({ adapter });

export default db;
