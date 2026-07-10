// Autor: Kevin
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BookCard, LoanStatusBadge } from "./book-card";
import type { Book } from "@/lib/mock-data";

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

describe("BookCard", () => {
  it("renders the book's title, author and stock", () => {
    render(<BookCard book={baseBook} onRequest={vi.fn()} onView={vi.fn()} />);

    expect(screen.getByText("1984")).toBeInTheDocument();
    expect(screen.getByText("George Orwell")).toBeInTheDocument();
    expect(screen.getByText("2 / 4 disponibles")).toBeInTheDocument();
    expect(screen.getByText("Disponible")).toBeInTheDocument();
  });

  it("shows 'Sin stock' and disables the request button when unavailable", () => {
    render(
      <BookCard
        book={{ ...baseBook, available: false, units: 0 }}
        onRequest={vi.fn()}
        onView={vi.fn()}
      />,
    );

    expect(screen.getByText("Sin stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /solicitar/i })).toBeDisabled();
  });

  it("calls onRequest when the request button is clicked", async () => {
    const onRequest = vi.fn();
    const user = userEvent.setup();
    render(<BookCard book={baseBook} onRequest={onRequest} onView={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /solicitar/i }));

    expect(onRequest).toHaveBeenCalledWith(baseBook);
  });

  it("calls onView when the view button is clicked", async () => {
    const onView = vi.fn();
    const user = userEvent.setup();
    render(<BookCard book={baseBook} onRequest={vi.fn()} onView={onView} />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);

    expect(onView).toHaveBeenCalledWith(baseBook);
  });
});

describe("LoanStatusBadge", () => {
  it("renders 'Activo' for active loans", () => {
    render(<LoanStatusBadge status="active" />);
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("renders 'Vencido' for overdue loans", () => {
    render(<LoanStatusBadge status="overdue" />);
    expect(screen.getByText("Vencido")).toBeInTheDocument();
  });

  it("renders 'Devuelto' for returned loans", () => {
    render(<LoanStatusBadge status="returned" />);
    expect(screen.getByText("Devuelto")).toBeInTheDocument();
  });
});
