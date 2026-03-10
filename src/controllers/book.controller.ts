import * as BookService from "../services/book.service.js";
import { Request, Response } from "express";
import { bookSchema, updateBookSchema } from "../validators/book.validator.js";

// 1. GET - Kõik raamatud
export async function getBooks(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "title";
    const order = (req.query.order as "asc" | "desc") || "asc";
    
    const filters = {
      title: req.query.title as string,
      language: req.query.language as string,
      year: req.query.year ? parseInt(req.query.year as string) : undefined
    };

    // Ootame andmeid andmebaasist
    const result = await BookService.getBooks(page, limit, filters, sortBy, order);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Andmete pärimine ebaõnnestus" });
  }
}

// 2. POST - Lisa uus raamat
export async function addBook(req: Request, res: Response) {
  try {
    const result = bookSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: result.error.flatten().fieldErrors 
      });
    }

    const book = await BookService.addBook(result.data);
    res.status(201).json(book);
  } catch (error: any) {
  console.error("DEBUG ERROR:", error); // See ilmub Sinu terminali, kus server jookseb
  res.status(500).json({ 
    error: "Raamatu lisamine ebaõnnestus", 
    message: error.message,
    code: error.code // Prisma veakood (nt P2003)
  });
}
}

// 3. GET BY ID
export async function getBookById(req: Request, res: Response) {
  try {
    const book = await BookService.getBookById(Number(req.params.id));
    book ? res.json(book) : res.status(404).json({ error: "Book not found" });
  } catch (error) {
    res.status(500).json({ error: "Serveri viga" });
  }
}

// 4. PATCH - Uuenda
export async function updateBook(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const result = updateBookSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: result.error.flatten().fieldErrors 
      });
    }

    const updated = await BookService.updateBook(id, result.data);

    if (!updated) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Uuendamine ebaõnnestus" });
  }
}

// 5. DELETE
export async function deleteBook(req: Request, res: Response) {
  try {
    const deleted = await BookService.deleteBook(Number(req.params.id));
    deleted ? res.status(204).send() : res.status(404).json({ error: "Book not found" });
  } catch (error) {
    res.status(500).json({ error: "Kustutamine ebaõnnestus" });
  }
}