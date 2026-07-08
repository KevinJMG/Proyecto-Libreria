import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CURRENT_USER_ID,
  INITIAL_BOOKS,
  INITIAL_LOANS,
  type Book,
  type Loan,
  type Role,
  type User,
} from "./mock-data";

interface LibraryState {
  user: User | null;
  books: Book[];
  loans: Loan[];
  theme: "light" | "dark";
  login: (email: string, role: Role, name?: string) => void;
  logout: () => void;
  register: (data: { name: string; email: string; username: string; role: Role }) => void;
  toggleTheme: () => void;
  updateUser: (patch: Partial<User>) => void;
  requestLoan: (bookId: string) => void;
  returnLoan: (loanId: string) => void;
  renewLoan: (loanId: string) => void;
  addBook: (book: Omit<Book, "id" | "popularity">) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  deleteBook: (id: string) => void;
}

const LibraryContext = createContext<LibraryState | null>(null);

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem("lib.user");
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (window.localStorage.getItem("lib.theme") as "light" | "dark") ?? "light";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("lib.theme", theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) window.localStorage.setItem("lib.user", JSON.stringify(user));
    else window.localStorage.removeItem("lib.user");
  }, [user]);

  const value: LibraryState = useMemo(
    () => ({
      user,
      books,
      loans,
      theme,
      login: (email, role, name) => {
        setUser({
          id: CURRENT_USER_ID,
          name: name ?? (role === "admin" ? "Administrador Demo" : "Ana Torres"),
          email,
          username: email.split("@")[0] || "usuario",
          role,
          createdAt: new Date().toISOString(),
        });
      },
      logout: () => setUser(null),
      register: ({ name, email, username, role }) => {
        setUser({
          id: CURRENT_USER_ID,
          name,
          email,
          username,
          role,
          createdAt: new Date().toISOString(),
        });
      },
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      updateUser: (patch) => setUser((u) => (u ? { ...u, ...patch } : u)),
      requestLoan: (bookId) => {
        const book = books.find((b) => b.id === bookId);
        if (!book || book.units <= 0 || !user) return;
        const newLoan: Loan = {
          id: `l${Date.now()}`,
          bookId,
          userId: user.id,
          userName: user.name,
          loanDate: addDays(0),
          dueDate: addDays(14),
          status: "active",
        };
        setLoans((prev) => [newLoan, ...prev]);
        setBooks((prev) =>
          prev.map((b) =>
            b.id === bookId ? { ...b, units: b.units - 1, available: b.units - 1 > 0 } : b,
          ),
        );
      },
      returnLoan: (loanId) => {
        setLoans((prev) => {
          const loan = prev.find((l) => l.id === loanId);
          if (loan) {
            setBooks((bs) =>
              bs.map((b) =>
                b.id === loan.bookId ? { ...b, units: b.units + 1, available: true } : b,
              ),
            );
          }
          return prev.map((l) =>
            l.id === loanId ? { ...l, status: "returned", returnDate: addDays(0) } : l,
          );
        });
      },
      renewLoan: (loanId) => {
        setLoans((prev) =>
          prev.map((l) =>
            l.id === loanId
              ? {
                  ...l,
                  dueDate: addDays(14),
                  status: "active",
                }
              : l,
          ),
        );
      },
      addBook: (book) => {
        setBooks((prev) => [
          { ...book, id: `b${Date.now()}`, popularity: 50 },
          ...prev,
        ]);
      },
      updateBook: (id, patch) => {
        setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
      },
      deleteBook: (id) => {
        setBooks((prev) => prev.filter((b) => b.id !== id));
        setLoans((prev) => prev.filter((l) => l.bookId !== id));
      },
    }),
    [user, books, loans, theme],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
