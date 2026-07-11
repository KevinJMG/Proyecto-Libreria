// Autor: Valentina
import { describe, it, expect } from "vitest";
import { cn, getErrorMessage } from "./utils";

describe("cn", () => {
  it("joins plain class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("resolves conflicting Tailwind classes, keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("applies conditional classes from objects", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });
});

describe("getErrorMessage", () => {
  it("returns the message of a real Error", () => {
    expect(getErrorMessage(new Error("algo falló"), "fallback")).toBe(
      "algo falló",
    );
  });

  it("returns the fallback for non-Error values", () => {
    expect(getErrorMessage("texto plano", "fallback")).toBe("fallback");
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
    expect(getErrorMessage({ code: 500 }, "fallback")).toBe("fallback");
  });

  it("returns the fallback when the Error has an empty message", () => {
    expect(getErrorMessage(new Error(""), "fallback")).toBe("fallback");
  });
});
