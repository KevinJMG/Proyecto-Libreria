// Autor: Daniel
import { describe, it, expect, afterEach, vi } from "vitest";
import { consumeLastCapturedError } from "./error-capture";

function dispatchUnhandledRejection(reason: unknown) {
  const event = new Event("unhandledrejection") as Event & { reason: unknown };
  Object.defineProperty(event, "reason", { value: reason });
  globalThis.dispatchEvent(event);
}

describe("error-capture", () => {
  afterEach(() => {
    vi.useRealTimers();
    // Drain any leftover captured error so tests stay isolated.
    consumeLastCapturedError();
  });

  it("returns undefined when nothing has been captured", () => {
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("captures a global 'error' event and returns it once", () => {
    const error = new Error("boom");
    globalThis.dispatchEvent(new ErrorEvent("error", { error }));

    expect(consumeLastCapturedError()).toBe(error);
    // Consuming clears the captured error, so a second call is empty.
    expect(consumeLastCapturedError()).toBeUndefined();
  });

  it("captures an 'unhandledrejection' event's reason", () => {
    const reason = new Error("promise rejected");
    dispatchUnhandledRejection(reason);

    expect(consumeLastCapturedError()).toBe(reason);
  });

  it("discards the captured error after the 5s TTL expires", () => {
    vi.useFakeTimers();
    try {
      globalThis.dispatchEvent(
        new ErrorEvent("error", { error: new Error("stale") }),
      );
      vi.advanceTimersByTime(5_001);
      expect(consumeLastCapturedError()).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the captured error available within the TTL window", () => {
    vi.useFakeTimers();
    try {
      const error = new Error("fresh");
      globalThis.dispatchEvent(new ErrorEvent("error", { error }));
      vi.advanceTimersByTime(1_000);
      expect(consumeLastCapturedError()).toBe(error);
    } finally {
      vi.useRealTimers();
    }
  });
});
