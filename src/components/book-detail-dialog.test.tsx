import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BookDetailDialog } from "./book-detail-dialog";
import type { Book, Loan, User } from "@/lib/mock-data";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

const requestLoan = vi.fn();
const deleteBook = vi.fn();

const baseBook: Book = {
  id: "b1",
  title: "1984",
  author: "George Orwell",
  isbn: "978-0451524935",
  year: 1949,
  category: "Ficción",
  description: "Distopía sobre un régimen totalitario.",
  coverUrl: "https://picsum.photos/seed/1984/400/600",
  available: true,
  units: 2,
  totalUnits: 4,
  popularity: 96,
};

const adminUser: User = {
  id: "u1",
  name: "Admin",
  username: "admin",
  email: "admin@example.com",
  role: "admin",
  createdAt: "2024-01-01",
};

let mockLibrary: {
  user: User | null;
  loans: Loan[];
  requestLoan: typeof requestLoan;
  deleteBook: typeof deleteBook;
};

vi.mock("@/lib/library-store", () => ({
  useLibrary: () => mockLibrary,
}));

describe("BookDetailDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLibrary = {
      user: null,
      loans: [],
      requestLoan,
      deleteBook,
    };
  });

  it("renders nothing when there is no book", () => {
    const { container } = render(
      <BookDetailDialog book={null} onOpenChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the book's details", () => {
    render(<BookDetailDialog book={baseBook} onOpenChange={vi.fn()} />);
    expect(screen.getByText("1984")).toBeInTheDocument();
    expect(screen.getByText(/George Orwell/)).toBeInTheDocument();
    expect(screen.getByText("Sin préstamos registrados.")).toBeInTheDocument();
  });

  it("does not show admin actions for a regular user", () => {
    mockLibrary.user = { ...adminUser, role: "user" };
    render(<BookDetailDialog book={baseBook} onOpenChange={vi.fn()} />);
    expect(screen.queryByText("Editar")).not.toBeInTheDocument();
  });

  it("shows admin actions for an admin user and requires a second click to delete", async () => {
    mockLibrary.user = adminUser;
    const user = userEvent.setup();
    render(
      <BookDetailDialog
        book={baseBook}
        onOpenChange={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    const deleteButton = screen.getByRole("button", { name: "Eliminar" });
    await user.click(deleteButton);
    expect(deleteBook).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Confirmar" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(deleteBook).toHaveBeenCalledWith("b1");
  });

  it("requests the loan and closes the dialog when available", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<BookDetailDialog book={baseBook} onOpenChange={onOpenChange} />);

    await user.click(
      screen.getByRole("button", { name: /solicitar préstamo/i }),
    );

    expect(requestLoan).toHaveBeenCalledWith("b1");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables the request button when the book is unavailable", () => {
    render(
      <BookDetailDialog
        book={{ ...baseBook, available: false }}
        onOpenChange={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /solicitar préstamo/i }),
    ).toBeDisabled();
  });

  it("lists loan history entries for the book", () => {
    mockLibrary.loans = [
      {
        id: "l1",
        bookId: "b1",
        userId: "u2",
        userName: "Luis Pérez",
        loanDate: "2024-01-01",
        dueDate: "2024-01-15",
        status: "active",
      },
    ];
    render(<BookDetailDialog book={baseBook} onOpenChange={vi.fn()} />);
    expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
  });
});
