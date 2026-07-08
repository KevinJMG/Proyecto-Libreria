import { Link, Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookMarked,
  BookOpenText,
  LayoutDashboard,
  Library,
  LogOut,
  Search,
  Settings2,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { useLibrary } from "@/lib/library-store";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("lib.user");
    if (!raw) throw redirect({ to: "/auth" });
  },
  component: AppLayout,
});

type Item = { title: string; to: string; icon: React.ComponentType<{ className?: string }>; adminOnly?: boolean };

const items: Item[] = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { title: "Biblioteca", to: "/library", icon: Library },
  { title: "Mis préstamos", to: "/my-loans", icon: BookMarked },
  { title: "Mi perfil", to: "/profile", icon: User },
];

const adminItems: Item[] = [
  { title: "Administrar libros", to: "/admin/books", icon: Settings2, adminOnly: true },
  { title: "Préstamos activos", to: "/admin/loans", icon: BarChart3, adminOnly: true },
];

function AppLayout() {
  const { user, logout } = useLibrary();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-brand text-white shadow-brand">
                <BookOpenText className="h-5 w-5" />
              </div>
              <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-bold">Biblioteca</span>
                <span className="truncate text-[11px] text-muted-foreground">
                  Gestión moderna
                </span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navegación</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((it) => (
                    <SidebarMenuItem key={it.to}>
                      <SidebarMenuButton asChild isActive={isActive(it.to)} tooltip={it.title}>
                        <Link to={it.to}>
                          <it.icon className="h-4 w-4" />
                          <span>{it.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user?.role === "admin" && (
              <SidebarGroup>
                <SidebarGroupLabel>Administración</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminItems.map((it) => (
                      <SidebarMenuItem key={it.to}>
                        <SidebarMenuButton asChild isActive={isActive(it.to)} tooltip={it.title}>
                          <Link to={it.to}>
                            <it.icon className="h-4 w-4" />
                            <span>{it.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarGroupLabel>Explorar</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/library")} tooltip="Buscar libros">
                      <Link to="/library">
                        <Search className="h-4 w-4" />
                        <span>Buscar libros</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip="Cerrar sesión">
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger />
            <AppHeader />
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
