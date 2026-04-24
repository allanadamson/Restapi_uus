import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString: string = process.env.DATABASE_URL || '';

if (!connectionString) {
  console.error("Viga: DATABASE_URL puudub .env failist!");
}

const pool = new pg.Pool({
  connectionString,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter
})

export default prisma;