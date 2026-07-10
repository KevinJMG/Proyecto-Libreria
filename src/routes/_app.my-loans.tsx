import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoanStatusBadge } from "@/components/book-card";
import { useLibrary } from "@/lib/library-store";

export const Route = createFileRoute("/_app/my-loans")({
  head: () => ({ meta: [{ title: "Mis préstamos — Biblioteca" }] }),
  component: MyLoansPage,
});

function MyLoansPage() {
  const { user, loans, books, renewLoan, returnLoan } = useLibrary();
  const [filter, setFilter] = useState("all");

  const myLoans = useMemo(() => {
    return loans
      .filter((l) => l.userId === user?.id)
      .filter((l) => (filter === "all" ? true : l.status === filter));
  }, [loans, user, filter]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mis préstamos</h1>
          <p className="text-sm text-muted-foreground">
            Consulta, renueva o devuelve tus libros.
          </p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="overdue">Vencidos</SelectItem>
            <SelectItem value="returned">Devueltos</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Libro</TableHead>
                <TableHead>Préstamo</TableHead>
                <TableHead>Devolución</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLoans.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No tienes préstamos que coincidan.
                  </TableCell>
                </TableRow>
              ) : (
                myLoans.map((l) => {
                  const b = books.find((x) => x.id === l.bookId);
                  const isDone = l.status === "returned";
                  return (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="font-medium">{b?.title ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {b?.author}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{l.loanDate}</TableCell>
                      <TableCell className="text-sm">{l.dueDate}</TableCell>
                      <TableCell>
                        <LoanStatusBadge status={l.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isDone}
                            onClick={() => {
                              renewLoan(l.id);
                              toast.success("Préstamo renovado por 14 días.");
                            }}
                          >
                            Renovar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                disabled={isDone}
                                className="bg-gradient-brand text-white hover:opacity-90"
                              >
                                Devolver
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Devolver este libro?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Marcarás "{b?.title}" como devuelto.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    returnLoan(l.id);
                                    toast.success("Libro devuelto");
                                  }}
                                >
                                  Confirmar devolución
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
