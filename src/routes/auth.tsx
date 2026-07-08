import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpenText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useLibrary } from "@/lib/library-store";
import type { Role } from "@/lib/mock-data";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Ingresar — Biblioteca" },
      { name: "description", content: "Inicia sesión o crea una cuenta en Biblioteca." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useLibrary();
  const [loading, setLoading] = useState(false);

  // login
  const [lEmail, setLEmail] = useState("");
  const [lPass, setLPass] = useState("");

  // register
  const [rName, setRName] = useState("");
  const [rUser, setRUser] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPass, setRPass] = useState("");
  const [rPass2, setRPass2] = useState("");
  const [rRole, setRRole] = useState<Role>("user");
  const [rTerms, setRTerms] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lEmail || !lPass) {
      toast.error("Completa correo y contraseña");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    // Demo: admin@lib.com => admin. Cualquier otro => user
    const role: Role = lEmail.toLowerCase().startsWith("admin") ? "admin" : "user";
    login(lEmail, role);
    toast.success("Sesión iniciada");
    navigate({ to: "/dashboard" });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rName || !rUser || !rEmail || !rPass) {
      toast.error("Completa todos los campos");
      return;
    }
    if (rPass !== rPass2) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (!rTerms) {
      toast.error("Debes aceptar los términos");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    register({ name: rName, email: rEmail, username: rUser, role: rRole });
    toast.success("Cuenta creada");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-brand">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-teal/40 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden text-white lg:block">
          <div className="mb-8 inline-flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-2 backdrop-blur">
            <BookOpenText className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-widest">Biblioteca</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Tu catálogo, préstamos y lectores en un solo lugar.
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/80">
            Gestión moderna, ligera y clara. Encuentra libros, controla préstamos y
            mantén tu comunidad lectora activa.
          </p>
          <ul className="mt-8 space-y-3 text-white/90">
            {["Catálogo con filtros avanzados", "Préstamos con renovación en un clic", "Panel administrativo con métricas"].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Sparkles className="h-4 w-4" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Auth card */}
        <div className="mx-auto w-full max-w-md rounded-3xl bg-card p-6 shadow-brand sm:p-8">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white">
              <BookOpenText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-bold">Biblioteca</div>
              <div className="text-xs text-muted-foreground">Gestión de libros</div>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Registro</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="l-email">Correo o usuario</Label>
                  <Input
                    id="l-email"
                    placeholder="tu@correo.com"
                    value={lEmail}
                    onChange={(e) => setLEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tip: usa <span className="font-mono">admin@lib.com</span> para acceso admin.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="l-pass">Contraseña</Label>
                    <button
                      type="button"
                      onClick={() => toast.info("Función demo: no hay backend aún.")}
                      className="text-xs text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <Input
                    id="l-pass"
                    type="password"
                    value={lPass}
                    onChange={(e) => setLPass(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-brand text-white shadow-brand hover:opacity-90" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Iniciar sesión"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="r-name">Nombre completo</Label>
                    <Input id="r-name" value={rName} onChange={(e) => setRName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-user">Usuario</Label>
                    <Input id="r-user" value={rUser} onChange={(e) => setRUser(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="r-email">Email</Label>
                  <Input id="r-email" type="email" value={rEmail} onChange={(e) => setREmail(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="r-pass">Contraseña</Label>
                    <Input id="r-pass" type="password" value={rPass} onChange={(e) => setRPass(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="r-pass2">Confirmar</Label>
                    <Input id="r-pass2" type="password" value={rPass2} onChange={(e) => setRPass2(e.target.value)} />
                    {rPass2 && rPass !== rPass2 && (
                      <p className="text-xs text-destructive">No coincide</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <RadioGroup
                    value={rRole}
                    onValueChange={(v) => setRRole(v as Role)}
                    className="grid grid-cols-2 gap-2"
                  >
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input p-3 hover:bg-accent/40">
                      <RadioGroupItem value="user" id="role-user" />
                      <span className="text-sm">Usuario</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-input p-3 hover:bg-accent/40">
                      <RadioGroupItem value="admin" id="role-admin" />
                      <span className="text-sm">Administrador</span>
                    </label>
                  </RadioGroup>
                </div>
                <label className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Checkbox checked={rTerms} onCheckedChange={(v) => setRTerms(v === true)} />
                  <span>
                    Acepto los <span className="text-primary underline">términos y condiciones</span>.
                  </span>
                </label>
                <Button type="submit" className="w-full bg-gradient-brand text-white shadow-brand hover:opacity-90" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
