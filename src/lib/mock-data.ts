export type Role = "user" | "admin";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  year: number;
  category: string;
  description: string;
  coverUrl: string;
  available: boolean;
  units: number;
  totalUnits: number;
  popularity: number;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: "active" | "overdue" | "returned";
}

export const CATEGORIES = [
  "Ficción",
  "No ficción",
  "Ciencia",
  "Historia",
  "Tecnología",
  "Arte",
  "Infantil",
  "Poesía",
];

const cover = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/600`;

export const INITIAL_BOOKS: Book[] = [
  { id: "b1", title: "Cien años de soledad", author: "Gabriel García Márquez", isbn: "978-0307474728", year: 1967, category: "Ficción", description: "La saga multigeneracional de la familia Buendía en el mítico Macondo.", coverUrl: cover("macondo"), available: true, units: 3, totalUnits: 4, popularity: 98 },
  { id: "b2", title: "El nombre del viento", author: "Patrick Rothfuss", isbn: "978-0756404741", year: 2007, category: "Ficción", description: "La historia de Kvothe, contada por él mismo, en un mundo de magia y música.", coverUrl: cover("kvothe"), available: true, units: 2, totalUnits: 3, popularity: 92 },
  { id: "b3", title: "Sapiens", author: "Yuval Noah Harari", isbn: "978-0062316097", year: 2011, category: "Historia", description: "Una breve historia de la humanidad desde la Edad de Piedra hasta hoy.", coverUrl: cover("sapiens"), available: false, units: 0, totalUnits: 2, popularity: 89 },
  { id: "b4", title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", year: 2008, category: "Tecnología", description: "Manual de buenas prácticas para escribir código legible y mantenible.", coverUrl: cover("cleancode"), available: true, units: 1, totalUnits: 2, popularity: 85 },
  { id: "b5", title: "Breve historia del tiempo", author: "Stephen Hawking", isbn: "978-0553380163", year: 1988, category: "Ciencia", description: "Un viaje por el cosmos, los agujeros negros y la naturaleza del tiempo.", coverUrl: cover("hawking"), available: true, units: 2, totalUnits: 2, popularity: 80 },
  { id: "b6", title: "El principito", author: "Antoine de Saint-Exupéry", isbn: "978-0156012195", year: 1943, category: "Infantil", description: "Un clásico universal sobre la amistad, el amor y la mirada de los niños.", coverUrl: cover("principito"), available: true, units: 4, totalUnits: 5, popularity: 95 },
  { id: "b7", title: "Rayuela", author: "Julio Cortázar", isbn: "978-8437604572", year: 1963, category: "Ficción", description: "Una novela laberinto que puede leerse de múltiples formas.", coverUrl: cover("rayuela"), available: false, units: 0, totalUnits: 1, popularity: 74 },
  { id: "b8", title: "Veinte poemas de amor", author: "Pablo Neruda", isbn: "978-8437604589", year: 1924, category: "Poesía", description: "Colección icónica del poeta chileno sobre el amor y la ausencia.", coverUrl: cover("neruda"), available: true, units: 2, totalUnits: 2, popularity: 78 },
  { id: "b9", title: "El arte de la guerra", author: "Sun Tzu", isbn: "978-1599869773", year: -500, category: "No ficción", description: "Tratado militar chino sobre estrategia aplicable a la vida y los negocios.", coverUrl: cover("suntzu"), available: true, units: 3, totalUnits: 3, popularity: 82 },
  { id: "b10", title: "1984", author: "George Orwell", isbn: "978-0451524935", year: 1949, category: "Ficción", description: "Distopía sobre un régimen totalitario que todo lo vigila.", coverUrl: cover("1984"), available: true, units: 2, totalUnits: 4, popularity: 96 },
  { id: "b11", title: "Diseñando la historia del arte", author: "E. H. Gombrich", isbn: "978-0714847252", year: 1950, category: "Arte", description: "Una introducción amena al arte occidental y sus grandes obras.", coverUrl: cover("gombrich"), available: true, units: 1, totalUnits: 1, popularity: 65 },
  { id: "b12", title: "El código Da Vinci", author: "Dan Brown", isbn: "978-0307474278", year: 2003, category: "Ficción", description: "Thriller que mezcla símbolos, arte y una conspiración milenaria.", coverUrl: cover("davinci"), available: true, units: 3, totalUnits: 3, popularity: 88 },
];

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
};

export const INITIAL_LOANS: Loan[] = [
  { id: "l1", bookId: "b3", userId: "u1", userName: "Ana Torres", loanDate: iso(addDays(today, -20)), dueDate: iso(addDays(today, -6)), status: "overdue" },
  { id: "l2", bookId: "b7", userId: "u1", userName: "Ana Torres", loanDate: iso(addDays(today, -10)), dueDate: iso(addDays(today, 4)), status: "active" },
  { id: "l3", bookId: "b1", userId: "u1", userName: "Ana Torres", loanDate: iso(addDays(today, -40)), dueDate: iso(addDays(today, -26)), returnDate: iso(addDays(today, -27)), status: "returned" },
  { id: "l4", bookId: "b10", userId: "u2", userName: "Luis Pérez", loanDate: iso(addDays(today, -5)), dueDate: iso(addDays(today, 9)), status: "active" },
  { id: "l5", bookId: "b4", userId: "u3", userName: "María Gómez", loanDate: iso(addDays(today, -15)), dueDate: iso(addDays(today, -1)), status: "overdue" },
  { id: "l6", bookId: "b6", userId: "u4", userName: "Carlos Ruiz", loanDate: iso(addDays(today, -2)), dueDate: iso(addDays(today, 12)), status: "active" },
];

export const CURRENT_USER_ID = "u1";
