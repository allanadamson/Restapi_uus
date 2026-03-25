import * as BookService from "../services/book.service.js";
import { Request, Response } from "express";
import { bookSchema, updateBookSchema } from "../validators/book.validator.js";

// 1. GET - Kõik raamatud (Otsing, Sort, Pagination)
export async function getBooks(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "title";
    const order = (req.query.order as "asc" | "desc") || "asc";
    
    // Lisame 'search' parameetri, et saaksid pealkirja järgi otsida
    const filters = {
      search: req.query.search as string,
      language: req.query.language as string,
      year: req.query.year ? parseInt(req.query.year as string) : undefined
    };

    const result = await BookService.getBooks(page, limit, filters, sortBy, order);
    
    // Ühtne response formaat (Andmed + Pagination metaandmed)
    res.json(result);
  } catch (error) {
    console.error("Viga getBooks:", error);
    res.status(500).json({ error: "Andmete pärimine ebaõnnestus" });
  }
}

// 2. POST - Lisa uus raamat (Valideerimine + 201 status)
export async function addBook(req: Request, res: Response) {
  try {
    const result = bookSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ 
        error: "Valideerimise viga", 
        details: result.error.flatten().fieldErrors 
      });
    }

    const book = await BookService.addBook(result.data);
    res.status(201).json(book);
  } catch (error: any) {
    // 409 Conflict, kui raamat on juba olemas (nt ISBN kattub)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "Sellise ISBN-iga raamat on juba olemas" });
    }
    res.status(500).json({ error: "Raamatu lisamine ebaõnnestus" });
  }
}

// 3. GET BY ID (Koos seostega)
export async function getBookById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Vigane ID formaat" });

    const book = await BookService.getBookById(id);
    
    if (!book) {
      return res.status(404).json({ error: "Raamatut ei leitud" });
    }
    
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: "Serveri viga raamatu leidmisel" });
  }
}

// 4. GET AVERAGE RATING (OSA 2 nõue)
export async function getBookRating(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Vigane raamatu ID" });
    }

    const ratingData = await BookService.getBookAverageRating(id);
    
    if (!ratingData) {
      return res.status(404).json({ error: "Raamatut ei leitud või arvustused puuduvad" });
    }

    res.json(ratingData);
  } catch (error) {
    res.status(500).json({ error: "Keskmise hinde arvutamine ebaõnnestus" });
  }
}

// 5. PATCH - Uuenda (Partial update)
export async function updateBook(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Vigane ID" });

    const result = updateBookSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ 
        error: "Valideerimise viga", 
        details: result.error.flatten().fieldErrors 
      });
    }

    const updated = await BookService.updateBook(id, result.data);

    if (!updated) {
      return res.status(404).json({ error: "Raamatut ei leitud" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Uuendamine ebaõnnestus" });
  }
}

// 6. DELETE (204 No Content edukal kustutamisel)
export async function deleteBook(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Vigane ID" });

    const deleted = await BookService.deleteBook(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Raamatut ei leitud" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Kustutamine ebaõnnestus" });
  }
}