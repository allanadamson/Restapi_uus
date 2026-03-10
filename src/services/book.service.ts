import prisma from "../lib/prisma.js";

// Ühtne liides paginationi jaoks vastavalt ülesande nõuetele
interface PaginatedResponse {
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// 1. GET - Kõik raamatud koos filtreerimise, sorteerimise ja paginationiga
export async function getBooks(
  page: number, 
  limit: number, 
  filters: any, 
  sortBy: string, 
  order: 'asc' | 'desc'
): Promise<PaginatedResponse> {
  const skip = (page - 1) * limit;
  
  // Dünaamiline filtri objekt
  const where: any = {};
  if (filters.title) where.title = { contains: filters.title, mode: 'insensitive' };
  if (filters.language) where.language = filters.language;
  if (filters.year) where.publishedYear = Number(filters.year);
  // Kui soovid lisada žanri filtrit (N:M seos)
  if (filters.genre) {
    where.genres = {
      some: {
        name: { contains: filters.genre, mode: 'insensitive' }
      }
    };
  }

  const [data, totalItems] = await Promise.all([
    prisma.book.findMany({
      where,
      take: limit,
      skip: skip,
      orderBy: { [sortBy]: order },
      include: { 
        author: true, 
        publisher: true, 
        genres: true, 
        reviews: true 
      } 
    }),
    prisma.book.count({ where })
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
}

// 2. GET BY ID
export async function getBookById(id: number) {
  return await prisma.book.findUnique({
    where: { id },
    include: { 
      author: true, 
      publisher: true, 
      genres: true, 
      reviews: true 
    }
  });
}

// 3. GET AVERAGE RATING (Nõutud OSA 2 punkt)
export async function getBookAverageRating(bookId: number) {
  const aggregate = await prisma.review.aggregate({
    where: { bookId },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  return {
    bookId,
    averageRating: aggregate._avg.rating ? parseFloat(aggregate._avg.rating.toFixed(2)) : 0,
    reviewCount: aggregate._count.rating,
  };
}

// 4. POST - Lisa uus raamat
export async function addBook(data: any) {
  const { genres, authorId, publisherId, ...bookFields } = data;

  const insertData: any = {
    ...bookFields,
    author: { connect: { id: Number(authorId) } },
    publisher: { connect: { id: Number(publisherId) } }
  };

  // N:M seos žanritega (connect)
  if (Array.isArray(genres) && genres.length > 0) {
    insertData.genres = {
      connect: genres.map((id: any) => ({ id: Number(id) }))
    };
  }

  return await prisma.book.create({
    data: insertData,
    include: { author: true, publisher: true, genres: true, reviews: true }
  });
}

// 5. PATCH - Uuenda raamatut
export async function updateBook(id: number, data: any) {
  const { genres, authorId, publisherId, ...bookFields } = data;

  return await prisma.book.update({
    where: { id },
    data: {
      ...bookFields,
      author: authorId ? { connect: { id: Number(authorId) } } : undefined,
      publisher: publisherId ? { connect: { id: Number(publisherId) } } : undefined,
      genres: genres ? {
        set: genres.map((id: any) => ({ id: Number(id) }))
      } : undefined
    },
    include: { author: true, publisher: true, genres: true, reviews: true }
  });
}

// 6. DELETE
export async function deleteBook(id: number) {
  try {
    await prisma.book.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}