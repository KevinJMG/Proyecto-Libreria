import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useLibrary } from "@/lib/library-store";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Mi perfil — Biblioteca" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loans, updateUser, theme, toggleTheme, logout } = useLibrary();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pass, setPass] = useState("");

  if (!user) return null;
  const mine = loans.filter((l) => l.userId === user.id);
  const read = mine.filter((l) => l.status === "returned").length;
  const active = mine.filter((l) => l.status !== "returned").length;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Mi perfil</h1>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-brand text-2xl font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-lg font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <Separator className="my-4" />
            <div className="grid w-full grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{read}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Leídos
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{active}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Actuales
                </div>
              </div>
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground">
              Miembro desde {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Nombre completo</Label>
                  <Input
                    id="p-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-email">Email</Label>
                  <Input
                    id="p-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button
                className="bg-gradient-brand text-white hover:opacity-90"
                onClick={() => {
                  updateUser({ name, email });
                  toast.success("Perfil actualizado");
                }}
              >
                Guardar cambios
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="p-pass">Nueva contraseña</Label>
                <Input
                  id="p-pass"
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (pass.length < 6)
                    return toast.error("Mínimo 6 caracteres");
                  setPass("");
                  toast.success("Contraseña actualizada (demo)");
                }}
              >
                Actualizar contraseña
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Modo oscuro</Label>
                  <p className="text-xs text-muted-foreground">
                    Cambia la apariencia de la aplicación.
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>
              <Separator />
              <Button
                variant="destructive"
                onClick={() => {
                  logout();
                  navigate({ to: "/auth" });
                }}
              >
                Cerrar sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
