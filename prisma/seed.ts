import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Alustan mahuka andmebaasi täitmist...')

  // Kustutame vana sisu, et uued andmed saaksid puhtalt peale tulla
  await prisma.review.deleteMany()
  await prisma.book.deleteMany()
  await prisma.author.deleteMany()
  await prisma.publisher.deleteMany()

  // 1. ŽANRID (Võtsin descriptioni välja, kuna seda pole skeemas)
  const genreNames = ['Klassika', 'Draama', 'Ulme', 'Krimka', 'Ajalugu']
  
  for (const name of genreNames) {
    await prisma.genre.upsert({
      where: { name: name },
      update: {},
      create: { name: name }
    })
  }
  const allGenres = await prisma.genre.findMany()

  // 2. KIRJASTAJAD
  const publishersData = [
    { id: 1, name: 'Noor-Eesti', country: 'Estonia', foundedYear: 1905 },
    { id: 2, name: 'Varrak', country: 'Estonia', foundedYear: 1991 },
    { id: 3, name: 'Tänapäev', country: 'Estonia', foundedYear: 1999 },
    { id: 4, name: 'Penguin Books', country: 'UK', foundedYear: 1935 },
  ]
  for (const pub of publishersData) {
    await prisma.publisher.upsert({
      where: { id: pub.id },
      update: {},
      create: pub
    })
  }

  // 3. AUTORID
  const authorsData = [
    { id: 1, firstName: 'Anton Hansen', lastName: 'Tammsaare', birthYear: 1878, nationality: 'Estonian' },
    { id: 2, firstName: 'Eduard', lastName: 'Vilde', birthYear: 1865, nationality: 'Estonian' },
    { id: 3, firstName: 'Oskar', lastName: 'Luts', birthYear: 1887, nationality: 'Estonian' },
    { id: 4, firstName: 'Marie', lastName: 'Under', birthYear: 1883, nationality: 'Estonian' },
    { id: 5, firstName: 'Jaan', lastName: 'Kross', birthYear: 1920, nationality: 'Estonian' },
    { id: 6, firstName: 'Andrus', lastName: 'Kivirähk', birthYear: 1970, nationality: 'Estonian' },
  ]
  for (const auth of authorsData) {
    await prisma.author.upsert({
      where: { id: auth.id },
      update: {},
      create: auth
    })
  }

  // 4. RAAMATUD (15 tükki)
  // LISASIN SIIA 'description', kuna tundub, et see on Book tabelis nõutud!
  for (let i = 1; i <= 15; i++) {
    await prisma.book.upsert({
      where: { id: i },
      update: {},
      create: {
        id: i,
        title: `Eesti Kirjanduse Varamu Vol ${i}`,
        isbn: `978-9985-01-${1000 + i}`,
        publishedYear: 1900 + (i * 5),
        pageCount: 150 + (i * 20),
        language: 'Estonian',
        description: `See on väga huvitav raamat, osa ${i} seeriast.`, // <--- TÕENÄOLINE ASUKOHT
        authorId: (i % 6) + 1,
        publisherId: (i % 4) + 1,
        genres: {
          connect: { id: allGenres[i % allGenres.length].id }
        }
      }
    })

    // 5. ARVUSTUSED
    await prisma.review.create({
      data: {
        bookId: i,
        userName: i % 2 === 0 ? 'Kalle' : 'Mari',
        rating: (i % 5) + 1,
        comment: 'Huvitav lugemine!'
      }
    })
  }

  console.log('✅ EDU! Andmed on Supabases.')
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