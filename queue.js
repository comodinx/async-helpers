"use strict";
/*
How it works:
`this.#head` is an instance of `Node` which keeps track of its current value and nests another instance of `Node` that keeps the value that comes after it. When a value is provided to `.enqueue()`, the code needs to iterate through `this.#head`, going deeper and deeper to find the last value. However, iterating through every single item is slow. This problem is solved by saving a reference to the last value as `this.#tail` so that it can reference it to add a new value.
*/
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Queue_head, _Queue_tail, _Queue_size;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueNode = void 0;
class QueueNode {
    constructor(value) {
        this.value = value;
    }
}
exports.QueueNode = QueueNode;
class Queue {
    constructor() {
        _Queue_head.set(this, void 0);
        _Queue_tail.set(this, void 0);
        _Queue_size.set(this, void 0);
        this.clear();
    }
    enqueue(value) {
        var _a;
        const node = new QueueNode(value);
        if (__classPrivateFieldGet(this, _Queue_head, "f")) {
            __classPrivateFieldGet(this, _Queue_tail, "f").next = node;
            __classPrivateFieldSet(this, _Queue_tail, node, "f");
        }
        else {
            __classPrivateFieldSet(this, _Queue_head, node, "f");
            __classPrivateFieldSet(this, _Queue_tail, node, "f");
        }
        __classPrivateFieldSet(this, _Queue_size, (_a = __classPrivateFieldGet(this, _Queue_size, "f"), _a++, _a), "f");
    }
    dequeue() {
        var _a;
        const current = __classPrivateFieldGet(this, _Queue_head, "f");
        if (!current) {
            return;
        }
        __classPrivateFieldSet(this, _Queue_head, __classPrivateFieldGet(this, _Queue_head, "f").next, "f");
        __classPrivateFieldSet(this, _Queue_size, (_a = __classPrivateFieldGet(this, _Queue_size, "f"), _a--, _a), "f");
        return current.value;
    }
    peek() {
        if (!__classPrivateFieldGet(this, _Queue_head, "f")) {
            return;
        }
        return __classPrivateFieldGet(this, _Queue_head, "f").value;
        // TODO: Node.js 18.
        // return this.#head?.value;
    }
    clear() {
        __classPrivateFieldSet(this, _Queue_head, undefined, "f");
        __classPrivateFieldSet(this, _Queue_tail, undefined, "f");
        __classPrivateFieldSet(this, _Queue_size, 0, "f");
    }
    get size() {
        return __classPrivateFieldGet(this, _Queue_size, "f");
    }
    *[(_Queue_head = new WeakMap(), _Queue_tail = new WeakMap(), _Queue_size = new WeakMap(), Symbol.iterator)]() {
        let current = __classPrivateFieldGet(this, _Queue_head, "f");
        while (current) {
            yield current.value;
            current = current.next;
        }
    }
    *drain() {
        while (__classPrivateFieldGet(this, _Queue_head, "f")) {
            yield this.dequeue();
        }
    }
}
exports.default = Queue;
