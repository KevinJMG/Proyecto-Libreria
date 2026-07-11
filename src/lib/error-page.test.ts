// Autor: Daniel
import { describe, it, expect } from "vitest";
import { renderErrorPage } from "./error-page";

describe("renderErrorPage", () => {
  it("returns a full HTML document", () => {
    const html = renderErrorPage();
    expect(html.trim().startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });

  it("includes a retry action and a link back home", () => {
    const html = renderErrorPage();
    expect(html).toContain("location.reload()");
    expect(html).toContain('href="/"');
  });

  it("is deterministic across calls", () => {
    expect(renderErrorPage()).toBe(renderErrorPage());
  });
});
