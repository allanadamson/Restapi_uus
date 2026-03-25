import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import bookRoutes from "./routes/book.routes.js";
import genreRoutes from "./routes/genre.routes.js";
import reviewRoutes from "./routes/review.routes.js";

// 1. Loo Express rakendus
const app: Application = express();

// 2. Port number (vastavalt juhendile Express: 3000)
const PORT: number = 3000;

// 3. Middleware seadistamine
app.use(cors()); // Lubab päringud teistelt portidelt/domeenidelt
app.use(express.json()); // Kohustuslik JSON body lugemiseks
app.use("/api/v1/genres", genreRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// 4. Baas-marsruut kontrolliks
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Library API is running', 
    version: '1.0.0',
    status: 'OK' 
  });
});

// 5. API Marsruudid
app.use('/api/v1/books', bookRoutes);

// 6. 404 Endpoint not found
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// 7. Globaalne Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Server Error:", err.stack);
  
  // Ühtne response formaat vigade jaoks
  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: err.message || "Midagi läks valesti"
  });
});

// 8. Käivita server
app.listen(PORT, () => {
  console.log(`🚀 Server is running!`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log(`📚 Books API: http://localhost:${PORT}/api/v1/books`);
});