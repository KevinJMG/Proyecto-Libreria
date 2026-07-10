import "@testing-library/jest-dom/vitest";

// Node 25+ ships its own global `localStorage`, which shadows jsdom's
// implementation and is a non-functional stub unless run with
// --localstorage-file (both globalThis.localStorage and window.localStorage
// end up pointing at that broken native object). Replace both with a
// minimal in-memory implementation so tests can rely on the real API.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

const memoryStorage = new MemoryStorage();
for (const target of [globalThis, window]) {
  Object.defineProperty(target, "localStorage", {
    value: memoryStorage,
    configurable: true,
    writable: true,
  });
}
