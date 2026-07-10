import { createFileRoute, Link } from "@tanstack/react-router";
import { BookMarked, BookOpenCheck, Library, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLibrary } from "@/lib/library-store";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Biblioteca" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, books, loans } = useLibrary();
  const myLoans = loans.filter((l) => l.userId === user?.id);
  const activeMine = myLoans.filter((l) => l.status === "active").length;
  const overdueMine = myLoans.filter((l) => l.status === "overdue").length;
  const top = [...books]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-brand p-6 text-white shadow-brand sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <p className="text-sm/6 uppercase tracking-widest text-white/70">
          Bienvenido de nuevo
        </p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
          Hola, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-lg text-white/80">
          Explora el catálogo, gestiona tus préstamos y descubre nuevas
          lecturas.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild className="bg-white text-primary hover:bg-white/90">
            <Link to="/library">Explorar biblioteca</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-white/40 bg-white/10 text-white hover:bg-white/20"
          >
            <Link to="/my-loans">Mis préstamos</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Library}
          label="Libros en catálogo"
          value={books.length}
        />
        <StatCard
          icon={BookOpenCheck}
          label="Disponibles"
          value={books.filter((b) => b.available).length}
        />
        <StatCard
          icon={BookMarked}
          label="Préstamos activos"
          value={activeMine}
        />
        <StatCard
          icon={TrendingUp}
          label="Vencidos"
          value={overdueMine}
          tone={overdueMine ? "danger" : undefined}
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Populares esta semana</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/library">Ver todo</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {top.map((b) => (
            <Card key={b.id} className="overflow-hidden py-0">
              <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
                <img
                  src={b.coverUrl}
                  alt={b.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-3">
                <h3 className="line-clamp-1 text-sm font-semibold">
                  {b.title}
                </h3>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {b.author}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">
                    {b.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    ★ {b.popularity}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
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
        <div
          className={
            "text-3xl font-bold " +
            (tone === "danger" ? "text-destructive" : "")
          }
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
