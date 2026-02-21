import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client.ts";

const adapter = new PrismaLibSql({
  url: "file:./prisma/dev.db",
});

const db = new PrismaClient({ adapter });

export default db;
