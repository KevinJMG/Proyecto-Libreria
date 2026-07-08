import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookCard } from "@/components/book-card";
import { BookDetailDialog } from "@/components/book-detail-dialog";
import { useLibrary } from "@/lib/library-store";
import { CATEGORIES, type Book } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/library")({
  head: () => ({ meta: [{ title: "Biblioteca — Catálogo" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const { books, requestLoan } = useLibrary();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [avail, setAvail] = useState<string>("all");
  const [sort, setSort] = useState<string>("popularity");
  const [selected, setSelected] = useState<Book | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = books.filter((b) => {
      if (q && !`${b.title} ${b.author} ${b.isbn}`.toLowerCase().includes(q)) return false;
      if (category !== "all" && b.category !== category) return false;
      if (avail === "yes" && !b.available) return false;
      if (avail === "no" && b.available) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "author") return a.author.localeCompare(b.author);
      if (sort === "year") return b.year - a.year;
      return b.popularity - a.popularity;
    });
    return list;
  }, [books, query, category, avail, sort]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <header>
        <h1 className="text-2xl font-bold">Biblioteca</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} de {books.length} libros
        </p>
      </header>

      <div className="grid gap-3 rounded-xl border border-border bg-card p-3 shadow-card sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, autor o ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Categoría" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={avail} onValueChange={setAvail}>
          <SelectTrigger><SelectValue placeholder="Disponibilidad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="yes">Disponibles</SelectItem>
            <SelectItem value="no">Sin stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger><SelectValue placeholder="Ordenar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Más populares</SelectItem>
            <SelectItem value="title">Título</SelectItem>
            <SelectItem value="author">Autor</SelectItem>
            <SelectItem value="year">Año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No encontramos libros con esos filtros.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((b) => (
            <BookCard
              key={b.id}
              book={b}
              onRequest={(bk) => {
                requestLoan(bk.id);
                toast.success("Préstamo solicitado", { description: bk.title });
              }}
              onView={setSelected}
            />
          ))}
        </div>
      )}

      <BookDetailDialog book={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
