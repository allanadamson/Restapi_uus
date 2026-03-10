import { Router } from "express";
import * as BookController from "../controllers/book.controller.js";

const router = Router();

router.get("/", BookController.getBooks);
router.post("/", BookController.addBook);

// See peab olema ENNE /:id teed!
router.get("/:id/average-rating", BookController.getBookRating);

router.get("/:id", BookController.getBookById);
router.patch("/:id", BookController.updateBook);
router.delete("/:id", BookController.deleteBook);

export default router;