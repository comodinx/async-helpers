import { test } from "node:test";
import assert from "node:assert/strict";
import Queue from "./queue";

//
// tests
//
test(".enqueue()", () => {
	const queue = new Queue();
	queue.enqueue("🦄");
	assert.strictEqual(queue.dequeue(), "🦄");
	queue.enqueue("🌈");
	queue.enqueue("❤️");
	assert.strictEqual(queue.dequeue(), "🌈");
	assert.strictEqual(queue.dequeue(), "❤️");
});

test(".dequeue()", () => {
	const queue = new Queue();
	assert.strictEqual(queue.dequeue(), undefined);
	assert.strictEqual(queue.dequeue(), undefined);
	queue.enqueue("🦄");
	assert.strictEqual(queue.dequeue(), "🦄");
	assert.strictEqual(queue.dequeue(), undefined);
});

test(".peek()", () => {
	const queue = new Queue();
	assert.strictEqual(queue.peek(), undefined);
	queue.enqueue("🦄");
	assert.strictEqual(queue.peek(), "🦄");
	queue.enqueue("🌈");
	assert.strictEqual(queue.peek(), "🦄");
	queue.dequeue();
	assert.strictEqual(queue.peek(), "🌈");
	queue.dequeue();
	assert.strictEqual(queue.peek(), undefined);
});

test(".clear()", () => {
	const queue = new Queue();
	queue.clear();
	queue.enqueue(1);
	queue.clear();
	assert.strictEqual(queue.size, 0);
	queue.enqueue(1);
	queue.enqueue(2);
	queue.enqueue(3);
	queue.clear();
	assert.strictEqual(queue.size, 0);
});

test(".size", () => {
	const queue = new Queue();
	assert.strictEqual(queue.size, 0);
	queue.clear();
	assert.strictEqual(queue.size, 0);
	queue.enqueue("🦄");
	assert.strictEqual(queue.size, 1);
	queue.enqueue("🦄");
	assert.strictEqual(queue.size, 2);
	queue.dequeue();
	assert.strictEqual(queue.size, 1);
	queue.dequeue();
	assert.strictEqual(queue.size, 0);
	queue.dequeue();
	assert.strictEqual(queue.size, 0);
});

test("iterable", () => {
	const queue = new Queue();
	queue.enqueue("🦄");
	queue.enqueue("🌈");
	assert.deepEqual([...queue], ["🦄", "🌈"]);
});

test(".drain()", () => {
	const queue = new Queue();
	queue.enqueue("🦄");
	queue.enqueue(undefined);
	queue.enqueue("🌈");
	assert.deepEqual([...queue.drain()], ["🦄", undefined, "🌈"]);
	assert.deepEqual([...queue], []);
	assert.strictEqual(queue.size, 0);
});
