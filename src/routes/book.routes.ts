import * as BookController from "../controllers/book.controller.js";
import { Router } from "express";

const router: Router = Router();

// Kuna "/api/v1/books" on juba index.ts-is kirjas, siis siia jääb ainult "/"
router.get("/", BookController.getBooks);           // Aadress: /api/v1/books
router.get("/:id", BookController.getBookById);     // Aadress: /api/v1/books/:id
router.post("/", BookController.addBook);           // Aadress: /api/v1/books
router.put("/:id", BookController.updateBook);      // Aadress: /api/v1/books/:id
router.delete("/:id", BookController.deleteBook);   // Aadress: /api/v1/books/:id

export default router;