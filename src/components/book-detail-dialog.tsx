import { useState } from "react";
import { Book } from "@/lib/mock-data";
import { useLibrary } from "@/lib/library-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookPlus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LoanStatusBadge } from "@/components/book-card";

interface Props {
  book: Book | null;
  onOpenChange: (o: boolean) => void;
  onEdit?: (b: Book) => void;
}

export function BookDetailDialog({ book, onOpenChange, onEdit }: Props) {
  const { user, loans, requestLoan, deleteBook } = useLibrary();
  const [confirming, setConfirming] = useState(false);

  if (!book) return null;
  const history = loans.filter((l) => l.bookId === book.id);

  return (
    <Dialog open={!!book} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{book.title}</DialogTitle>
          <DialogDescription>{book.author} · {book.year}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <img src={book.coverUrl} alt={book.title} className="w-full rounded-lg object-cover shadow-card" />
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{book.category}</Badge>
              {book.available ? (
                <Badge className="bg-success text-success-foreground">Disponible</Badge>
              ) : (
                <Badge variant="destructive">Sin stock</Badge>
              )}
              <span className="text-xs text-muted-foreground">ISBN: {book.isbn}</span>
            </div>
            <p className="text-muted-foreground">{book.description}</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <div><span className="font-semibold text-foreground">{book.units}</span> disponibles</div>
              <div><span className="font-semibold text-foreground">{book.totalUnits}</span> totales</div>
              <div><span className="font-semibold text-foreground">{book.popularity}</span> popularidad</div>
            </div>
            <Separator />
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Historial de préstamos
              </h4>
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin préstamos registrados.</p>
              ) : (
                <ul className="max-h-32 space-y-1 overflow-auto text-xs">
                  {history.map((l) => (
                    <li key={l.id} className="flex items-center justify-between rounded-md bg-muted/50 px-2 py-1">
                      <span className="truncate">{l.userName}</span>
                      <span className="text-muted-foreground">{l.loanDate} → {l.dueDate}</span>
                      <LoanStatusBadge status={l.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {user?.role === "admin" && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit?.(book)}>
                <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (!confirming) {
                    setConfirming(true);
                    toast("Confirma para eliminar", { description: "Toca de nuevo Eliminar." });
                    return;
                  }
                  deleteBook(book.id);
                  toast.success("Libro eliminado");
                  onOpenChange(false);
                }}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> {confirming ? "Confirmar" : "Eliminar"}
              </Button>
            </div>
          )}
          <Button
            className="bg-gradient-brand text-white hover:opacity-90"
            disabled={!book.available}
            onClick={() => {
              requestLoan(book.id);
              toast.success("Préstamo solicitado", {
                description: `${book.title} · devolución en 14 días.`,
              });
              onOpenChange(false);
            }}
          >
            <BookPlus className="mr-1 h-4 w-4" /> Solicitar préstamo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
