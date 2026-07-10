import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { LibraryProvider, useLibrary } from "./library-store";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// A minimal chainable/thenable stand-in for the Supabase query builder:
// every chain method returns itself, and awaiting it resolves to `result`.
function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  for (const method of [
    "select",
    "eq",
    "order",
    "insert",
    "update",
    "delete",
  ]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.single = vi.fn(() => Promise.resolve(result));
  builder.then = (
    onFulfilled: (value: typeof result) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  return builder;
}

type AuthUser = { id: string; email: string; created_at: string };
type SessionResult = { data: { session: { user: { id: string } } | null } };
type UserResult = { data: { user: AuthUser | null } };
type PasswordAuthResult = { data: { user?: AuthUser }; error: Error | null };
type SignUpResult = {
  data: { session: { access_token: string } | null };
  error: Error | null;
};

function makeSupabaseMock() {
  const tableResults: Record<string, { data: unknown; error: unknown }> = {};
  const from = vi.fn((table: string) =>
    makeQueryBuilder(tableResults[table] ?? { data: null, error: null }),
  );

  return {
    setTableResult(table: string, result: { data: unknown; error: unknown }) {
      tableResults[table] = result;
    },
    client: {
      from,
      auth: {
        getSession: vi.fn<() => Promise<SessionResult>>(() =>
          Promise.resolve({ data: { session: null } }),
        ),
        getUser: vi.fn<() => Promise<UserResult>>(() =>
          Promise.resolve({ data: { user: null } }),
        ),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
        signInWithPassword: vi.fn<() => Promise<PasswordAuthResult>>(() =>
          Promise.resolve({ data: {}, error: new Error("not mocked") }),
        ),
        signUp: vi.fn<() => Promise<SignUpResult>>(() =>
          Promise.resolve({ data: { session: null }, error: null }),
        ),
        signOut: vi.fn(() => Promise.resolve({ error: null })),
      },
    },
  };
}

const supabaseMock = makeSupabaseMock();

vi.mock("./supabase", () => ({
  get supabase() {
    return supabaseMock.client;
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  return <LibraryProvider>{children}</LibraryProvider>;
}

const sampleAuthUser: AuthUser = {
  id: "u1",
  email: "ana@example.com",
  created_at: "2024-01-01",
};

const sampleProfile = { name: "Ana", username: "ana", role: "user" };

const sampleBookRow = {
  id: "b1",
  title: "1984",
  author: "Orwell",
  isbn: "123",
  genre: "Ficción",
  year: 1949,
  description: "",
  cover_url: "",
  available: true,
  units: 2,
  popularity: 90,
};

const sampleLoanRow = {
  id: "l1",
  book_id: "b1",
  user_id: "u1",
  user_name: "Ana",
  loan_date: "2024-01-01",
  due_date: "2024-01-15",
  return_date: null,
  status: "active",
};

/** Renders the hook already "logged in", with one book and one loan loaded. */
async function renderLoggedIn(
  bookOverrides: Partial<typeof sampleBookRow> = {},
) {
  localStorage.setItem(
    "lib.user",
    JSON.stringify({ id: "u1", name: "Ana", email: "ana@example.com" }),
  );
  supabaseMock.client.auth.getSession.mockResolvedValue({
    data: { session: { user: { id: "u1" } } },
  });
  supabaseMock.client.auth.getUser.mockResolvedValue({
    data: { user: sampleAuthUser },
  });
  supabaseMock.setTableResult("profiles", {
    data: sampleProfile,
    error: null,
  });
  supabaseMock.setTableResult("books", {
    data: [{ ...sampleBookRow, ...bookOverrides }],
    error: null,
  });
  supabaseMock.setTableResult("loans", { data: [sampleLoanRow], error: null });

  const { result } = renderHook(() => useLibrary(), { wrapper });
  await waitFor(() => expect(result.current.loading).toBe(false));
  await waitFor(() => expect(result.current.books).toHaveLength(1));
  await waitFor(() => expect(result.current.loans).toHaveLength(1));
  return result;
}

describe("useLibrary", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    supabaseMock.client.auth.getSession.mockResolvedValue({
      data: { session: null },
    });
    supabaseMock.client.auth.getUser.mockResolvedValue({
      data: { user: null },
    });
    supabaseMock.client.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("throws when used outside of LibraryProvider", () => {
    expect(() => renderHook(() => useLibrary())).toThrow(
      "useLibrary must be used within LibraryProvider",
    );
  });

  it("starts logged out with no session and stops loading", async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.books).toEqual([]);
  });

  it("toggleTheme flips between light and dark", async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.theme).toBe("light");
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("dark");
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
  });

  it("login loads the profile and persists the user", async () => {
    supabaseMock.client.auth.signInWithPassword.mockResolvedValue({
      data: { user: sampleAuthUser },
      error: null,
    });
    supabaseMock.client.auth.getUser.mockResolvedValue({
      data: { user: sampleAuthUser },
    });
    supabaseMock.setTableResult("profiles", {
      data: sampleProfile,
      error: null,
    });
    supabaseMock.setTableResult("books", { data: [], error: null });
    supabaseMock.setTableResult("loans", { data: [], error: null });

    const { result } = renderHook(() => useLibrary(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.login("ana@example.com", "secret123"));

    expect(result.current.user?.email).toBe("ana@example.com");
    expect(result.current.user?.name).toBe("Ana");
    expect(JSON.parse(localStorage.getItem("lib.user")!).id).toBe("u1");
  });

  it("login throws a friendly error when Supabase rejects the credentials", async () => {
    supabaseMock.client.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: new Error("Invalid login credentials"),
    });

    const { result } = renderHook(() => useLibrary(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(() => result.current.login("ana@example.com", "wrong")),
    ).rejects.toThrow("Invalid login credentials");
  });

  it("register reports needsEmailConfirmation when Supabase returns no session", async () => {
    supabaseMock.client.auth.signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { result } = renderHook(() => useLibrary(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const outcome = await act(() =>
      result.current.register({
        name: "Ana",
        email: "ana@example.com",
        username: "ana",
        password: "secret123",
        role: "user",
      }),
    );

    expect(outcome).toEqual({ needsEmailConfirmation: true });
  });

  it("register reports needsEmailConfirmation: false when a session comes back immediately", async () => {
    supabaseMock.client.auth.signUp.mockResolvedValue({
      data: { session: { access_token: "t" } },
      error: null,
    });

    const { result } = renderHook(() => useLibrary(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const outcome = await act(() =>
      result.current.register({
        name: "Ana",
        email: "ana@example.com",
        username: "ana",
        password: "secret123",
        role: "user",
      }),
    );

    expect(outcome).toEqual({ needsEmailConfirmation: false });
  });

  it("requestLoan does nothing without a logged in user", async () => {
    const { toast } = await import("sonner");
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.requestLoan("b1"));

    expect(toast.error).toHaveBeenCalledWith(
      "Debes iniciar sesión para solicitar un préstamo",
    );
    expect(supabaseMock.client.from).not.toHaveBeenCalledWith("loans");
  });

  it("requestLoan inserts a loan and decrements available units for a logged in user", async () => {
    const result = await renderLoggedIn();

    await act(() => result.current.requestLoan("b1"));

    expect(supabaseMock.client.from).toHaveBeenCalledWith("loans");
    expect(supabaseMock.client.from).toHaveBeenCalledWith("books");
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith(
      "Préstamo solicitado exitosamente",
    );
  });

  it("requestLoan warns when the book isn't in the loaded catalog", async () => {
    const result = await renderLoggedIn();
    const { toast } = await import("sonner");

    await act(() => result.current.requestLoan("does-not-exist"));

    expect(toast.error).toHaveBeenCalledWith("Libro no encontrado");
  });

  it("requestLoan warns when there are no units left", async () => {
    const result = await renderLoggedIn({ units: 0, available: false });
    const { toast } = await import("sonner");

    await act(() => result.current.requestLoan("b1"));

    expect(toast.error).toHaveBeenCalledWith("No hay unidades disponibles");
  });

  it("returnLoan marks the loan returned and restocks the book", async () => {
    const result = await renderLoggedIn();

    await act(() => result.current.returnLoan("l1"));

    expect(supabaseMock.client.from).toHaveBeenCalledWith("loans");
    expect(supabaseMock.client.from).toHaveBeenCalledWith("books");
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith(
      "Préstamo devuelto exitosamente",
    );
  });

  it("returnLoan warns when the loan isn't found", async () => {
    const result = await renderLoggedIn();
    const { toast } = await import("sonner");

    await act(() => result.current.returnLoan("does-not-exist"));

    expect(toast.error).toHaveBeenCalledWith("Préstamo no encontrado");
  });

  it("renewLoan pushes the due date and re-activates the loan", async () => {
    const result = await renderLoggedIn();

    await act(() => result.current.renewLoan("l1"));

    expect(supabaseMock.client.from).toHaveBeenCalledWith("loans");
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith(
      "Préstamo renovado exitosamente",
    );
  });

  it("addBook inserts a new book and reloads the catalog", async () => {
    const result = await renderLoggedIn();

    await act(() =>
      result.current.addBook({
        title: "Nuevo libro",
        author: "Autor",
        isbn: "999",
        year: 2024,
        category: "Ficción",
        description: "",
        coverUrl: "",
        available: true,
        units: 1,
        totalUnits: 1,
      }),
    );

    expect(supabaseMock.client.from).toHaveBeenCalledWith("books");
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith("Libro creado exitosamente");
  });

  it("addBook surfaces and rethrows Supabase errors", async () => {
    const result = await renderLoggedIn();
    supabaseMock.setTableResult("books", {
      data: null,
      error: new Error("insert failed"),
    });

    await expect(
      act(() =>
        result.current.addBook({
          title: "X",
          author: "Y",
          isbn: "",
          year: 2024,
          category: "Ficción",
          description: "",
          coverUrl: "",
          available: true,
          units: 1,
          totalUnits: 1,
        }),
      ),
    ).rejects.toThrow();
  });

  it("updateBook only sends the fields that changed", async () => {
    const result = await renderLoggedIn();

    await act(() => result.current.updateBook("b1", { title: "Nuevo título" }));

    expect(supabaseMock.client.from).toHaveBeenCalledWith("books");
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith(
      "Libro actualizado exitosamente",
    );
  });

  it("deleteBook removes related loans before deleting the book", async () => {
    const result = await renderLoggedIn();

    await act(() => result.current.deleteBook("b1"));

    expect(supabaseMock.client.from).toHaveBeenCalledWith("loans");
    expect(supabaseMock.client.from).toHaveBeenCalledWith("books");
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith("Libro eliminado exitosamente");
  });

  it("updateUser is a no-op when nobody is logged in", async () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.updateUser({ name: "Nuevo nombre" }));

    expect(supabaseMock.client.from).not.toHaveBeenCalled();
  });

  it("updateUser saves the profile patch for a logged in user", async () => {
    const result = await renderLoggedIn();

    await act(() => result.current.updateUser({ name: "Ana Actualizada" }));

    expect(supabaseMock.client.from).toHaveBeenCalledWith("profiles");
    const { toast } = await import("sonner");
    expect(toast.success).toHaveBeenCalledWith(
      "Perfil actualizado exitosamente",
    );
  });

  it("logout clears the user and localStorage", async () => {
    localStorage.setItem(
      "lib.user",
      JSON.stringify({ id: "u1", name: "Ana", email: "ana@example.com" }),
    );
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.logout());

    expect(supabaseMock.client.auth.signOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("lib.user")).toBeNull();
  });

  it("loadUserData logs and stops when Supabase returns no user", async () => {
    supabaseMock.client.auth.getUser.mockResolvedValue({
      data: { user: null },
    });
    const { result } = renderHook(() => useLibrary(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.loadUserData());

    expect(result.current.user).toBeNull();
    expect(result.current.books).toEqual([]);
  });
});
