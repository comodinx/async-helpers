/*
How it works:
`this.#head` is an instance of `Node` which keeps track of its current value and nests another instance of `Node` that keeps the value that comes after it. When a value is provided to `.enqueue()`, the code needs to iterate through `this.#head`, going deeper and deeper to find the last value. However, iterating through every single item is slow. This problem is solved by saving a reference to the last value as `this.#tail` so that it can reference it to add a new value.
*/

export class QueueNode {
	value: any;
	next: QueueNode | undefined;

	constructor(value: any) {
		this.value = value;
	}
}

export default class Queue {
	#head: QueueNode | undefined;
	#tail: QueueNode | undefined;
	#size: number;

	constructor() {
		this.clear();
	}

	enqueue(value: any): void {
		const node = new QueueNode(value);

		if (this.#head) {
			this.#tail!.next = node;
			this.#tail = node;
		} else {
			this.#head = node;
			this.#tail = node;
		}

		this.#size++;
	}

	dequeue(): any {
		const current = this.#head;
		if (!current) {
			return;
		}

		this.#head = this.#head!.next;
		this.#size--;
		return current.value;
	}

	peek(): any {
		if (!this.#head) {
			return;
		}

		return this.#head.value;

		// TODO: Node.js 18.
		// return this.#head?.value;
	}

	clear(): void {
		this.#head = undefined;
		this.#tail = undefined;
		this.#size = 0;
	}

	get size(): number {
		return this.#size;
	}

	* [Symbol.iterator](): Generator<any, void, unknown> {
		let current = this.#head;

		while (current) {
			yield current.value;
			current = current.next;
		}
	}

	* drain(): Generator<any, void, unknown> {
		while (this.#head) {
			yield this.dequeue();
		}
	}
}
