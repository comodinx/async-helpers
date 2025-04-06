export default class Queue {
    enqueue(value: any): void;
    dequeue(): any;
    peek(): any;
    clear(): void;
    get size(): any;
    drain(): Generator<any, void, unknown>;
    [Symbol.iterator](): Generator<any, void, unknown>;
    #private;
}
