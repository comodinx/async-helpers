"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncLimitFn = exports.asyncLimit = void 0;
const queue_js_1 = __importDefault(require("./queue.js"));
const asyncLimit = (concurrency) => {
    assertConcurrency(concurrency);
    const queue = new queue_js_1.default();
    let activeCount = 0;
    const resumeNext = () => {
        if (activeCount < concurrency && queue.size > 0) {
            queue.dequeue()();
            // Since `pendingCount` has been decreased by one, increase `activeCount` by one.
            activeCount++;
        }
    };
    const next = () => {
        activeCount--;
        resumeNext();
    };
    const run = async (function_, resolve, arguments_) => {
        const result = (async () => function_(...arguments_))();
        resolve(result);
        try {
            await result;
        }
        catch { }
        next();
    };
    const enqueue = (function_, resolve, arguments_) => {
        // Queue `internalResolve` instead of the `run` function
        // to preserve asynchronous context.
        new Promise(internalResolve => {
            queue.enqueue(internalResolve);
        }).then(run.bind(undefined, function_, resolve, arguments_));
        (async () => {
            // This function needs to wait until the next microtask before comparing
            // `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
            // after the `internalResolve` function is dequeued and called. The comparison in the if-statement
            // needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
            await Promise.resolve();
            if (activeCount < concurrency) {
                resumeNext();
            }
        })();
    };
    const generator = (function_, ...arguments_) => new Promise(resolve => {
        enqueue(function_, resolve, arguments_);
    });
    Object.defineProperties(generator, {
        activeCount: {
            get: () => activeCount,
        },
        pendingCount: {
            get: () => queue.size,
        },
        clearQueue: {
            value() {
                queue.clear();
            },
        },
        concurrency: {
            get: () => concurrency,
            set(newConcurrency) {
                assertConcurrency(newConcurrency);
                concurrency = newConcurrency;
                queueMicrotask(() => {
                    // eslint-disable-next-line no-unmodified-loop-condition
                    while (activeCount < concurrency && queue.size > 0) {
                        resumeNext();
                    }
                });
            },
        },
    });
    return generator;
};
exports.asyncLimit = asyncLimit;
const asyncLimitFn = (function_, option) => {
    const { concurrency } = option;
    const limit = (0, exports.asyncLimit)(concurrency);
    return (...arguments_) => limit(() => function_(...arguments_));
};
exports.asyncLimitFn = asyncLimitFn;
const assertConcurrency = (concurrency) => {
    if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency > 0)) {
        throw new TypeError("Expected `concurrency` to be a number from 1 and up");
    }
};
