import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Moon, Search, Sun, User } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLibrary } from "@/lib/library-store";

export function AppHeader() {
  const { user, logout, theme, toggleTheme, loans, books } = useLibrary();
  const navigate = useNavigate();

  const overdueForMe = loans.filter(
    (l) => l.userId === user?.id && l.status === "overdue",
  );

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  return (
    <div className="flex flex-1 items-center gap-3">
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={`Buscar entre ${books.length} libros...`}
          className="pl-9"
          onFocus={() => navigate({ to: "/library" })}
          readOnly
        />
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notificaciones"
            >
              <Bell className="h-4 w-4" />
              {overdueForMe.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {overdueForMe.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="mb-2 text-sm font-semibold">Notificaciones</div>
            {overdueForMe.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin notificaciones nuevas.
              </p>
            ) : (
              <ul className="space-y-2">
                {overdueForMe.map((l) => {
                  const b = books.find((x) => x.id === l.bookId);
                  return (
                    <li
                      key={l.id}
                      className="rounded-md border border-border p-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Vencido</Badge>
                        <span className="font-medium">{b?.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Devolución esperada: {l.dueDate}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-brand text-xs font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold leading-tight">
                  {user?.name}
                </div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {user?.role === "admin" ? "Administrador" : "Usuario"}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
              <User className="mr-2 h-4 w-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                logout();
                toast.success("Sesión cerrada");
                navigate({ to: "/auth" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
