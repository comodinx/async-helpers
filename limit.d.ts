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
    <Arguments extends unknown[], ReturnType>(function_: (...arguments_: Arguments) => PromiseLike<ReturnType> | ReturnType, ...arguments_: Arguments): Promise<ReturnType>;
};
export declare const asyncLimit: (concurrency: number) => LimitFunction;
export declare const asyncLimitFn: (function_: any, option: any) => (...arguments_: any[]) => Promise<any>;
