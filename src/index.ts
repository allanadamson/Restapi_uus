import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import bookRoutes from "./routes/book.routes.js";
import genreRoutes from "./routes/genre.routes.js";
import reviewRoutes from "./routes/review.routes.js";

const app: Application = express();
const PORT: number = 3000;

app.use(cors());
app.use(express.json());

// 1. API MARSRUUDID
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/genres", genreRoutes);
app.use("/api/v1/reviews", reviewRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Library API is running', status: 'OK' });
});

// 2. 404 HANDLER (Peab olema viimane)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// 3. Globaalne error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: err.message || "Midagi läks valesti"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server jookseb: http://localhost:${PORT}`);
});