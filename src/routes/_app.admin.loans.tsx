import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertTriangle, BookMarked, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoanStatusBadge } from "@/components/book-card";
import { useLibrary } from "@/lib/library-store";

export const Route = createFileRoute("/_app/admin/loans")({
  head: () => ({ meta: [{ title: "Préstamos activos — Admin" }] }),
  component: AdminLoansPage,
});

function AdminLoansPage() {
  const { user, loans, books, returnLoan } = useLibrary();

  const active = loans.filter((l) => l.status === "active").length;
  const overdue = loans.filter((l) => l.status === "overdue").length;

  const topBooks = useMemo(() => {
    const counts = new Map<string, number>();
    loans.forEach((l) => counts.set(l.bookId, (counts.get(l.bookId) ?? 0) + 1));
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([bookId, count]) => ({ book: books.find((b) => b.id === bookId), count }))
      .filter((x) => x.book);
  }, [loans, books]);

  const topUsers = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    loans.forEach((l) => {
      const cur = counts.get(l.userId);
      counts.set(l.userId, { name: l.userName, count: (cur?.count ?? 0) + 1 });
    });
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [loans]);

  if (user?.role !== "admin") {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Sección solo para administradores.
      </div>
    );
  }

  const rows = [...loans].sort((a, b) => (a.status === "overdue" ? -1 : 1));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Gestión de préstamos</h1>
        <p className="text-sm text-muted-foreground">Métricas y control de todos los préstamos.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={BookMarked} label="Préstamos activos" value={active} />
        <Stat icon={AlertTriangle} label="Vencidos" value={overdue} tone="danger" />
        <Stat icon={TrendingUp} label="Total registrados" value={loans.length} />
        <Stat icon={Users} label="Usuarios distintos" value={new Set(loans.map((l) => l.userId)).size} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Libros más solicitados</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topBooks.map(({ book, count }) => (
              <div key={book!.id} className="flex items-center gap-3">
                <img src={book!.coverUrl} alt="" className="h-10 w-8 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{book!.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{book!.author}</div>
                </div>
                <div className="text-sm font-semibold text-primary">{count}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Usuarios más activos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topUsers.map((u) => (
              <div key={u.name} className="flex items-center justify-between">
                <span className="text-sm">{u.name}</span>
                <span className="text-sm font-semibold text-primary">{u.count} préstamos</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Todos los préstamos</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Libro</TableHead>
                <TableHead>Préstamo</TableHead>
                <TableHead>Devolución</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((l) => {
                const b = books.find((x) => x.id === l.bookId);
                return (
                  <TableRow key={l.id}>
                    <TableCell>{l.userName}</TableCell>
                    <TableCell className="font-medium">{b?.title}</TableCell>
                    <TableCell className="text-sm">{l.loanDate}</TableCell>
                    <TableCell className="text-sm">{l.dueDate}</TableCell>
                    <TableCell><LoanStatusBadge status={l.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={l.status === "returned"}
                        onClick={() => {
                          returnLoan(l.id);
                          toast.success("Devolución registrada");
                        }}
                      >
                        Devolver
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone?: "danger";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <div
          className={
            tone === "danger"
              ? "grid h-9 w-9 place-items-center rounded-lg bg-destructive/10 text-destructive"
              : "grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand-soft text-primary"
          }
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={"text-3xl font-bold " + (tone === "danger" ? "text-destructive" : "")}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
