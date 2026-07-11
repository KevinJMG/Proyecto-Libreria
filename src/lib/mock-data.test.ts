// Autor: Jerson
import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  CURRENT_USER_ID,
  INITIAL_BOOKS,
  INITIAL_LOANS,
} from "./mock-data";

describe("CATEGORIES", () => {
  it("has no duplicate categories", () => {
    expect(new Set(CATEGORIES).size).toBe(CATEGORIES.length);
  });

  it("includes the core categories used across the app", () => {
    expect(CATEGORIES).toEqual(
      expect.arrayContaining(["Ficción", "Ciencia", "Tecnología"]),
    );
  });
});

describe("INITIAL_BOOKS", () => {
  it("has unique ids", () => {
    const ids = INITIAL_BOOKS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only uses categories declared in CATEGORIES", () => {
    for (const book of INITIAL_BOOKS) {
      expect(CATEGORIES).toContain(book.category);
    }
  });

  it("generates a picsum cover URL derived from the book id", () => {
    for (const book of INITIAL_BOOKS) {
      expect(book.coverUrl).toMatch(
        /^https:\/\/picsum\.photos\/seed\/.+\/400\/600$/,
      );
    }
  });

  it("marks a book unavailable exactly when it has zero units", () => {
    for (const book of INITIAL_BOOKS) {
      expect(book.available).toBe(book.units > 0);
    }
  });

  it("never has more units in stock than total units", () => {
    for (const book of INITIAL_BOOKS) {
      expect(book.units).toBeLessThanOrEqual(book.totalUnits);
    }
  });
});

describe("INITIAL_LOANS", () => {
  it("only references books that exist in INITIAL_BOOKS", () => {
    const bookIds = new Set(INITIAL_BOOKS.map((b) => b.id));
    for (const loan of INITIAL_LOANS) {
      expect(bookIds.has(loan.bookId)).toBe(true);
    }
  });

  it("produces valid ISO date strings (YYYY-MM-DD) for loanDate/dueDate", () => {
    for (const loan of INITIAL_LOANS) {
      expect(loan.loanDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(loan.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("marks loans as overdue only when the due date is in the past", () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const loan of INITIAL_LOANS) {
      if (loan.status === "overdue") {
        expect(loan.dueDate < today).toBe(true);
      }
    }
  });

  it("only sets returnDate on loans with status 'returned'", () => {
    for (const loan of INITIAL_LOANS) {
      if (loan.returnDate) {
        expect(loan.status).toBe("returned");
      }
    }
  });
});

describe("CURRENT_USER_ID", () => {
  it("matches the user id used by INITIAL_LOANS' Ana Torres entries", () => {
    const anaLoans = INITIAL_LOANS.filter((l) => l.userName === "Ana Torres");
    expect(anaLoans.every((l) => l.userId === CURRENT_USER_ID)).toBe(true);
  });
});
