import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { Book, Loan, Role, User } from "./mock-data";
import { getErrorMessage } from "./utils";
import { toast } from "sonner";

type BookRow = {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  genre: string | null;
  year: number | null;
  description: string | null;
  cover_url: string | null;
  available: boolean | null;
  units: number | null;
  popularity: number | null;
};

type LoanRow = {
  id: string;
  book_id: string;
  user_id: string;
  user_name: string | null;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  status: Loan["status"] | null;
};

type BookUpdatePayload = Partial<{
  title: string;
  author: string;
  isbn: string;
  genre: string;
  year: number;
  description: string;
  cover_url: string;
  units: number;
  available: boolean;
}>;

interface LibraryState {
  user: User | null;
  books: Book[];
  loans: Loan[];
  theme: "light" | "dark";
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    username: string;
    password: string;
    role: Role;
  }) => Promise<void>;
  toggleTheme: () => void;
  updateUser: (patch: Partial<User>) => Promise<void>;
  requestLoan: (bookId: string) => Promise<void>;
  returnLoan: (loanId: string) => Promise<void>;
  renewLoan: (loanId: string) => Promise<void>;
  addBook: (book: Omit<Book, "id" | "popularity">) => Promise<void>;
  updateBook: (id: string, patch: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  loadUserData: () => Promise<void>;
}

const LibraryContext = createContext<LibraryState | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("lib.user");
    return raw ? JSON.parse(raw) : null;
  });
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (
      (window.localStorage.getItem("lib.theme") as "light" | "dark") ?? "light"
    );
  });
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales y suscribirse a cambios de autenticación
  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserData();
      }
      setLoading(false);
    };
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await loadUserData();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setBooks([]);
        setLoans([]);
        localStorage.removeItem("lib.user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sincronizar tema con localStorage
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("lib.theme", theme);
  }, [theme]);

  // ============================================
  // FUNCIÓN PARA CARGAR DATOS DEL USUARIO
  // ============================================
  const loadUserData = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        return;
      }

      // Obtener perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      const userData: User = {
        id: authUser.id,
        name: profile?.name || authUser.email?.split("@")[0] || "Usuario",
        email: authUser.email!,
        username: profile?.username || authUser.email?.split("@")[0] || "",
        role: profile?.role || "user",
        createdAt: authUser.created_at,
      };
      setUser(userData);
      localStorage.setItem("lib.user", JSON.stringify(userData));

      // Cargar TODOS los libros
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*")
        .order("title");

      if (booksError) throw booksError;

      const mappedBooks: Book[] = (booksData || []).map((b: BookRow) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn || "",
        category: b.genre || "Otros",
        year: b.year || new Date().getFullYear(),
        description: b.description || "",
        coverUrl: b.cover_url || "https://picsum.photos/seed/new/400/600",
        available: b.available ?? true,
        units: b.units || 0,
        totalUnits: b.units || 0,
        popularity: b.popularity || 50,
      }));

      setBooks(mappedBooks);

      // Cargar préstamos del usuario
      const { data: loansData, error: loansError } = await supabase
        .from("loans")
        .select("*")
        .eq("user_id", authUser.id)
        .order("loan_date", { ascending: false });

      if (loansError) throw loansError;

      const mappedLoans: Loan[] = (loansData || []).map((l: LoanRow) => ({
        id: l.id,
        bookId: l.book_id,
        userId: l.user_id,
        userName: l.user_name || "Usuario",
        loanDate: l.loan_date,
        dueDate: l.due_date,
        returnDate: l.return_date || undefined,
        status: l.status || "active",
      }));

      setLoans(mappedLoans);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // ============================================
  // FUNCIONES DE AUTENTICACIÓN
  // ============================================
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        const userData = {
          id: data.user.id,
          name: profile?.name || data.user.email?.split("@")[0] || "Usuario",
          email: data.user.email!,
          username: profile?.username || data.user.email?.split("@")[0] || "",
          role: profile?.role || "user",
          createdAt: data.user.created_at,
        };

        setUser(userData);
        localStorage.setItem("lib.user", JSON.stringify(userData));
        await loadUserData();
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(getErrorMessage(error, "Error al iniciar sesión"));
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    username: string;
    password: string;
    role: Role;
  }) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          username: data.username,
          role: data.role,
        },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("lib.user");
  };

  // ============================================
  // FUNCIONES DE PRÉSTAMOS
  // ============================================
  const requestLoan = async (bookId: string) => {
    if (!user) {
      toast.error("Debes iniciar sesión para solicitar un préstamo");
      return;
    }

    try {
      const book = books.find((b) => b.id === bookId);
      if (!book) {
        toast.error("Libro no encontrado");
        return;
      }

      if (book.units <= 0) {
        toast.error("No hay unidades disponibles");
        return;
      }

      const { error: loanError } = await supabase.from("loans").insert({
        book_id: bookId,
        user_id: user.id,
        user_name: user.name,
        loan_date: new Date().toISOString().split("T")[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        status: "active",
      });

      if (loanError) throw loanError;

      const { error: updateError } = await supabase
        .from("books")
        .update({
          units: book.units - 1,
          available: book.units - 1 > 0,
        })
        .eq("id", bookId);

      if (updateError) throw updateError;

      await loadUserData();
      toast.success("Préstamo solicitado exitosamente");
    } catch (error) {
      console.error("Error requesting loan:", error);
      toast.error(getErrorMessage(error, "Error al solicitar el préstamo"));
    }
  };

  const returnLoan = async (loanId: string) => {
    try {
      const loan = loans.find((l) => l.id === loanId);
      if (!loan) {
        toast.error("Préstamo no encontrado");
        return;
      }

      const { error: loanError } = await supabase
        .from("loans")
        .update({
          status: "returned",
          return_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", loanId);

      if (loanError) throw loanError;

      const book = books.find((b) => b.id === loan.bookId);
      if (book) {
        const { error: updateError } = await supabase
          .from("books")
          .update({
            units: book.units + 1,
            available: true,
          })
          .eq("id", loan.bookId);

        if (updateError) throw updateError;
      }

      await loadUserData();
      toast.success("Préstamo devuelto exitosamente");
    } catch (error) {
      console.error("Error returning loan:", error);
      toast.error(getErrorMessage(error, "Error al devolver el préstamo"));
    }
  };

  const renewLoan = async (loanId: string) => {
    try {
      const { error } = await supabase
        .from("loans")
        .update({
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          status: "active",
        })
        .eq("id", loanId);

      if (error) throw error;

      await loadUserData();
      toast.success("Préstamo renovado exitosamente");
    } catch (error) {
      console.error("Error renewing loan:", error);
      toast.error(getErrorMessage(error, "Error al renovar el préstamo"));
    }
  };

  // ============================================
  // FUNCIONES DE LIBROS (CRUD)
  // ============================================
  const addBook = async (book: Omit<Book, "id" | "popularity">) => {
    try {
      const { error } = await supabase.from("books").insert({
        title: book.title,
        author: book.author,
        isbn: book.isbn || "",
        genre: book.category || "Otros",
        year: book.year || new Date().getFullYear(),
        description: book.description || "",
        cover_url: book.coverUrl || "https://picsum.photos/seed/new/400/600",
        units: book.totalUnits || 1,
        available: book.available !== undefined ? book.available : true,
        popularity: 50,
      });

      if (error) throw error;

      await loadUserData();
      toast.success("Libro creado exitosamente");
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error(getErrorMessage(error, "Error al crear el libro"));
      throw error;
    }
  };

  const updateBook = async (id: string, patch: Partial<Book>) => {
    try {
      const updateData: BookUpdatePayload = {};
      if (patch.title !== undefined) updateData.title = patch.title;
      if (patch.author !== undefined) updateData.author = patch.author;
      if (patch.isbn !== undefined) updateData.isbn = patch.isbn;
      if (patch.category !== undefined) updateData.genre = patch.category;
      if (patch.year !== undefined) updateData.year = patch.year;
      if (patch.description !== undefined)
        updateData.description = patch.description;
      if (patch.coverUrl !== undefined) updateData.cover_url = patch.coverUrl;
      if (patch.totalUnits !== undefined) {
        updateData.units = patch.totalUnits;
        updateData.available = patch.totalUnits > 0;
      }
      if (patch.available !== undefined) updateData.available = patch.available;

      const { error } = await supabase
        .from("books")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      await loadUserData();
      toast.success("Libro actualizado exitosamente");
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error(getErrorMessage(error, "Error al actualizar el libro"));
      throw error;
    }
  };

  const deleteBook = async (id: string) => {
    try {
      // Eliminar préstamos relacionados primero
      const { error: loansError } = await supabase
        .from("loans")
        .delete()
        .eq("book_id", id);

      if (loansError) throw loansError;

      // Eliminar el libro
      const { error } = await supabase.from("books").delete().eq("id", id);

      if (error) throw error;

      await loadUserData();
      toast.success("Libro eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error(getErrorMessage(error, "Error al eliminar el libro"));
      throw error;
    }
  };

  const updateUser = async (patch: Partial<User>) => {
    if (!user) return;
    try {
      await supabase.from("profiles").update(patch).eq("id", user.id);
      await loadUserData();
      toast.success("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(getErrorMessage(error, "Error al actualizar el perfil"));
    }
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = useMemo<LibraryState>(
    () => ({
      user,
      books,
      loans,
      theme,
      loading,
      login,
      logout,
      register,
      toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
      updateUser,
      requestLoan,
      returnLoan,
      renewLoan,
      addBook,
      updateBook,
      deleteBook,
      loadUserData,
    }),
    [user, books, loans, theme, loading],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}
