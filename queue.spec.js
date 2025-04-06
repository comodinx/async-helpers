import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Queue from "./queue.js";

describe("queue", () => {
  it("queue", () => {
    const queue = new Queue();
    queue.enqueue("🦄");

    const item = queue.dequeue();
    
    assert(typeof item === "string", "debería tener una respuesta de tipo string");
    assert(item === "🦄", "debería ser 🦄");
  });
});
