export declare class QueueNode {
    value: any;
    next: QueueNode | undefined;
    constructor(value: any);
}
export default class Queue {
    #private;
    constructor();
    enqueue(value: any): void;
    dequeue(): any;
    peek(): any;
    clear(): void;
    get size(): number;
    [Symbol.iterator](): Generator<any, void, unknown>;
    drain(): Generator<any, void, unknown>;
}
