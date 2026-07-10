import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppHeader } from "./app-header";
import type { Book, Loan, User } from "@/lib/mock-data";

const navigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const toggleTheme = vi.fn();
const logout = vi.fn();

const baseUser: User = {
  id: "u1",
  name: "Ana Torres",
  username: "ana",
  email: "ana@example.com",
  role: "user",
  createdAt: "2024-01-01",
};

const baseBook: Book = {
  id: "b1",
  title: "1984",
  author: "Orwell",
  isbn: "123",
  year: 1949,
  category: "Ficción",
  description: "",
  coverUrl: "",
  available: true,
  units: 2,
  totalUnits: 4,
  popularity: 90,
};

let mockLibrary: {
  user: User | null;
  logout: typeof logout;
  theme: "light" | "dark";
  toggleTheme: typeof toggleTheme;
  loans: Loan[];
  books: Book[];
};

vi.mock("@/lib/library-store", () => ({
  useLibrary: () => mockLibrary,
}));

describe("AppHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLibrary = {
      user: baseUser,
      logout,
      theme: "light",
      toggleTheme,
      loans: [],
      books: [baseBook],
    };
  });

  it("shows the user's initials", () => {
    render(<AppHeader />);
    expect(screen.getByText("AT")).toBeInTheDocument();
  });

  it("falls back to 'US' when there is no user", () => {
    mockLibrary.user = null;
    render(<AppHeader />);
    expect(screen.getByText("US")).toBeInTheDocument();
  });

  it("toggles the theme when the theme button is clicked", async () => {
    const user = userEvent.setup();
    render(<AppHeader />);

    await user.click(screen.getByRole("button", { name: /cambiar tema/i }));

    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("does not show a notification badge without overdue loans", () => {
    render(<AppHeader />);
    const bellButton = screen.getByRole("button", { name: /notificaciones/i });
    expect(bellButton.querySelector("span")).toBeNull();
  });

  it("shows a badge with the count of overdue loans for the current user", () => {
    mockLibrary.loans = [
      {
        id: "l1",
        bookId: "b1",
        userId: "u1",
        userName: "Ana Torres",
        loanDate: "2024-01-01",
        dueDate: "2024-01-10",
        status: "overdue",
      },
      {
        id: "l2",
        bookId: "b1",
        userId: "u2",
        userName: "Otro",
        loanDate: "2024-01-01",
        dueDate: "2024-01-10",
        status: "overdue",
      },
    ];
    render(<AppHeader />);
    const bellButton = screen.getByRole("button", { name: /notificaciones/i });
    expect(bellButton).toHaveTextContent("1");
  });

  it("logs out, notifies and navigates to /auth from the menu", async () => {
    const user = userEvent.setup();
    render(<AppHeader />);

    await user.click(screen.getByText("Ana Torres"));
    await user.click(screen.getByText("Cerrar sesión"));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith({ to: "/auth" });
  });
});
