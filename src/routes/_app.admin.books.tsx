import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useLibrary } from "@/lib/library-store";
import { CATEGORIES, type Book } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/admin/books")({
  head: () => ({ meta: [{ title: "Administrar libros — Biblioteca" }] }),
  component: AdminBooksPage,
});

const PAGE_SIZE = 8;

function emptyBook(): Omit<Book, "id" | "popularity"> {
  return {
    title: "",
    author: "",
    isbn: "",
    year: new Date().getFullYear(),
    category: CATEGORIES[0],
    description: "",
    coverUrl: "https://picsum.photos/seed/new/400/600",
    available: true,
    units: 1,
    totalUnits: 1,
  };
}

function AdminBooksPage() {
  const { user, books, addBook, updateBook, deleteBook } = useLibrary();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] =
    useState<Omit<Book, "id" | "popularity">>(emptyBook());

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q
      ? books.filter((b) =>
          `${b.title} ${b.author} ${b.isbn}`.toLowerCase().includes(q),
        )
      : books;
  }, [books, query]);

  if (user?.role !== "admin") {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Sección solo para administradores.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openNew = () => {
    setEditing(null);
    setForm(emptyBook());
    setOpen(true);
  };
  const openEdit = (b: Book) => {
    setEditing(b);
    const { id, popularity, ...rest } = b;
    setForm(rest);
    setOpen(true);
  };

  const save = () => {
    if (!form.title || !form.author)
      return toast.error("Título y autor son obligatorios");
    if (editing) {
      updateBook(editing.id, form);
      toast.success("Libro actualizado");
    } else {
      addBook(form);
      toast.success("Libro creado");
    }
    setOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Administrar libros</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} libros · página {page} de {totalPages}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="w-64 pl-9"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button
            className="bg-gradient-brand text-white hover:opacity-90"
            onClick={openNew}
          >
            <Plus className="mr-1 h-4 w-4" /> Agregar libro
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {b.id}
                  </TableCell>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>{b.author}</TableCell>
                  <TableCell className="font-mono text-xs">{b.isbn}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{b.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {b.available ? (
                      <Badge className="bg-success text-success-foreground">
                        {b.units}/{b.totalUnits}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Sin stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(b)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          if (confirm(`¿Eliminar "${b.title}"?`)) {
                            deleteBook(b.id);
                            toast.success("Libro eliminado");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar libro" : "Nuevo libro"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Título" className="sm:col-span-2">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>
            <Field label="Autor">
              <Input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
            </Field>
            <Field label="ISBN">
              <Input
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              />
            </Field>
            <Field label="Año">
              <Input
                type="number"
                value={form.year}
                onChange={(e) =>
                  setForm({ ...form, year: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Categoría">
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Descripción" className="sm:col-span-2">
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
              />
            </Field>
            <Field label="URL de portada" className="sm:col-span-2">
              <Input
                value={form.coverUrl}
                onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
              />
            </Field>
            <Field label="Unidades">
              <Input
                type="number"
                value={form.totalUnits}
                onChange={(e) => {
                  const total = Math.max(0, Number(e.target.value));
                  setForm({
                    ...form,
                    totalUnits: total,
                    units: Math.min(form.units, total),
                    available: total > 0 && form.units > 0,
                  });
                }}
              />
            </Field>
            <Field label="Disponible">
              <div className="flex h-9 items-center">
                <Switch
                  checked={form.available}
                  onCheckedChange={(v) => setForm({ ...form, available: v })}
                />
              </div>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-gradient-brand text-white hover:opacity-90"
              onClick={save}
            >
              {editing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={"space-y-1.5 " + (className ?? "")}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
