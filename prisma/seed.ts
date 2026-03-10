import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Alustan andmebaasi täitmist...')

  // 1. Loo Autor (kasutame upsert, et vältida duplikaatide vigu)
  const author = await prisma.author.upsert({
    where: { id: 1 },
    update: {},
    create: {
      firstName: 'Anton Hansen',
      lastName: 'Tammsaare',
      birthYear: 1878,
      nationality: 'Estonian'
    },
  })

  // 2. Loo Kirjastaja
  // EEMALDATUD 'city', kuna seda pole skeemas!
  const publisher = await prisma.publisher.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Noor-Eesti',
      country: 'Estonia',
      foundedYear: 1905
    },
  })

  // 3. Loo Žanr
  const genre = await prisma.genre.upsert({
    where: { name: 'Klassika' },
    update: {},
    create: {
      name: 'Klassika'
    },
  })

  console.log('✅ Andmed on kontrollitud/sisestatud:', { 
    authorId: author.id, 
    publisherId: publisher.id 
  })
}

main()
  .catch((e) => {
    console.error('❌ Seeding ebaõnnestus:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })