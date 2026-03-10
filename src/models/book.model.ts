export interface Book {
  id: number;                // Hiljem Prismaga tõenäoliselt string/uuid
  title: string;
  isbn: string;              // Kohustuslik (validatsioonis kontrollitakse)
  publishedYear: number;
  pageCount: number;         // Kohustuslik
  language: string;          // Kohustuslik (vajalik filtri jaoks)
  description: string;
  coverImage?: string;       // Optsionaalne
  authorId: number;          // Seos Autoriga (juhendis nõutud)
  publisherId: number;       // Seos Kirjastusega
  genres: string[];          // Massiiv (N:M seos)
  createdAt: Date;
  updatedAt: Date;
}