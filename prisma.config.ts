import 'dotenv/config';

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  /**
   * env() throws when the variable is absent. The datasource is therefore only declared once it is
   * known, so that `prisma generate` can run during install, before any database exists.
   */
  datasource: process.env.DATABASE_URL ? { url: env('DATABASE_URL') } : {},
});
