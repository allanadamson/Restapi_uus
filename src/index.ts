import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import bookRoutes from "./routes/book.routes.js";

// 1. Loo Express rakendus
const app: Application = express();

// 2. Port number (vastavalt juhendile Express: 3000)
const PORT: number = 3000;

// 3. Middleware seadistamine
app.use(cors()); // Lubab päringud teistelt portidelt/domeenidelt
app.use(express.json()); // Kohustuslik JSON body lugemiseks

// 4. Baas-marsruut kontrolliks
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Library API is running', 
    version: '1.0.0',
    status: 'OK' 
  });
});

// 5. API Marsruudid (Kasutame juhendis nõutud /api/v1/ eesliidet)
app.use('/api/v1/books', bookRoutes);

// 6. 404 Endpoint not found (kui ühtegi teist route-i ei leitud)
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// 7. Globaalne Error Handling Middleware (Kohustuslik tehniline osa)
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