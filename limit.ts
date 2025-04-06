import Queue from "./queue.js";

export type LimitFunction = {
  /** The number of promises that are currently running. */
  readonly activeCount: number;

  /** The number of promises that are waiting to run (i.e. their internal `fn` was not called yet). */
  readonly pendingCount: number;

  /** Get or set the concurrency limit. */
  concurrency: number;

  /** Discard pending promises that are waiting to run.
  This might be useful if you want to teardown the queue at the end of your program's lifecycle or discard any function calls referencing an intermediary state of your app.
  Note: This does not cancel promises that are already running. */
  clearQueue: () => void;

  /**
   * @param fn - Promise-returning/async function.
   * @param arguments - Any arguments to pass through to `fn`. Support for passing arguments on to the `fn` is provided in order to be able to avoid creating unnecessary closures. You probably don't need this optimization unless you're pushing a lot of functions.
   * @returns The promise returned by calling `fn(...arguments)`.
   */
  <Arguments extends unknown[], ReturnType>(
    function_: (...arguments_: Arguments) => PromiseLike<ReturnType> | ReturnType,
    ...arguments_: Arguments
  ): Promise<ReturnType>;
};

export const asyncLimit = (concurrency: number): LimitFunction => {
  assertConcurrency(concurrency);

  const queue = new Queue();
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
    } catch {}

    next();
  };

  const enqueue = (function_, resolve, arguments_) => {
    // Queue `internalResolve` instead of the `run` function
    // to preserve asynchronous context.
    new Promise(internalResolve => {
      queue.enqueue(internalResolve);
    }).then(
      run.bind(undefined, function_, resolve, arguments_),
    );

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

  return generator as LimitFunction;
};

export const asyncLimitFn = (function_: any, option: any): (...arguments_: any[]) => Promise<any> => {
  const { concurrency } = option;
  const limit = asyncLimit(concurrency);

  return (...arguments_) => limit(() => function_(...arguments_));
};

const assertConcurrency = (concurrency: number | undefined | null): void => {
  if (!((Number.isInteger(concurrency) || concurrency === Number.POSITIVE_INFINITY) && concurrency! > 0)) {
    throw new TypeError("Expected `concurrency` to be a number from 1 and up");
  }
};
