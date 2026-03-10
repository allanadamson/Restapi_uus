import prisma from "../lib/prisma.js";
import { Book } from "@prisma/client";

export interface PaginatedResponse {
  data: Book[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// 1. GET - Kõik raamatud koos filtreerimise ja paginatsiooniga
export async function getBooks(
  page: number, 
  limit: number, 
  filters: any, 
  sortBy: string, 
  order: 'asc' | 'desc'
): Promise<PaginatedResponse> {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.title) where.title = { contains: filters.title, mode: 'insensitive' };
  if (filters.language) where.language = filters.language;
  if (filters.year) where.publishedYear = Number(filters.year);

  const [data, totalItems] = await Promise.all([
    prisma.book.findMany({
      where,
      take: limit,
      skip: skip,
      orderBy: { [sortBy]: order },
      include: { author: true, publisher: true, genres: true } 
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
    include: { author: true, publisher: true, genres: true }
  });
}

// 3. POST - Lisa uus raamat
export async function addBook(data: any) {
  const { genres, authorId, publisherId, ...bookFields } = data;

  // Koostame andmeobjekti samm-sammult
  const insertData: any = {
    ...bookFields,
    author: {
      connect: { id: Number(authorId) }
    },
    publisher: {
      connect: { id: Number(publisherId) }
    }
  };

  // LISAME genres AINULT SIIS, KUI MASSIIV POLE TÜHI
  // See garanteerib, et Prisma ei näe isegi "genres: []" võtit
  if (Array.isArray(genres) && genres.length > 0) {
    insertData.genres = {
      connect: genres.map((id: number) => ({ id: Number(id) }))
    };
  }

  return await prisma.book.create({
    data: insertData,
    include: { author: true, publisher: true, genres: true }
  });
}

// 4. PATCH - Uuenda
export async function updateBook(id: number, data: any) {
  const { genres, authorId, publisherId, ...bookFields } = data;

  return await prisma.book.update({
    where: { id },
    data: {
      ...bookFields,
      // Kui ID-d on kaasas, siis uuendame seoseid
      author: authorId ? { connect: { id: Number(authorId) } } : undefined,
      publisher: publisherId ? { connect: { id: Number(publisherId) } } : undefined,
      genres: genres ? {
        set: genres.map((id: number) => ({ id: Number(id) }))
      } : undefined
    },
    include: { author: true, publisher: true, genres: true }
  });
}

// 5. DELETE
export async function deleteBook(id: number) {
  try {
    await prisma.book.delete({ where: { id } });
    return true;
  } catch (e) {
    return false;
  }
}