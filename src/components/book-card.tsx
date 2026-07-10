import { Book, Loan } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, BookPlus } from "lucide-react";

interface Props {
  book: Book;
  onRequest: (b: Book) => void;
  onView: (b: Book) => void;
}

export function BookCard({ book, onRequest, onView }: Props) {
  return (
    <Card className="group overflow-hidden border-border/60 py-0 transition-all hover:-translate-y-0.5 hover:shadow-card">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        <img
          src={book.coverUrl}
          alt={book.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex gap-1">
          <Badge variant="secondary" className="backdrop-blur">
            {book.category}
          </Badge>
        </div>
        <div className="absolute right-2 top-2">
          {book.available ? (
            <Badge className="bg-success text-success-foreground">
              Disponible
            </Badge>
          ) : (
            <Badge variant="destructive">Sin stock</Badge>
          )}
        </div>
      </div>
      <CardContent className="space-y-2 p-4">
        <div>
          <h3 className="line-clamp-1 font-semibold leading-tight">
            {book.title}
          </h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {book.author}
          </p>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{book.year}</span>
          <span>
            {book.units} / {book.totalUnits} disponibles
          </span>
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 bg-gradient-brand text-white hover:opacity-90 disabled:opacity-50"
            disabled={!book.available}
            onClick={() => onRequest(book)}
          >
            <BookPlus className="mr-1 h-3.5 w-3.5" /> Solicitar
          </Button>
          <Button size="sm" variant="outline" onClick={() => onView(book)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function LoanStatusBadge({ status }: { status: Loan["status"] }) {
  if (status === "active")
    return <Badge className="bg-primary text-primary-foreground">Activo</Badge>;
  if (status === "overdue") return <Badge variant="destructive">Vencido</Badge>;
  return <Badge variant="secondary">Devuelto</Badge>;
}
