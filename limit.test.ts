import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AsyncLocalStorage } from 'node:async_hooks';
import { asyncLimit, asyncLimitFn } from './limit';

//
// helpers
//

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const isInRange = (value, { start, end }) =>
  value >= start && value <= end;

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const timeSpan = () => {
  const start = performance.now();
  return () => performance.now() - start;
};

//
// tests
//

test('concurrency: 1', async () => {
  const input = [
    [10, 300],
    [20, 200],
    [30, 100],
  ];

  const end = timeSpan();
  const limit = asyncLimit(1);

  const mapper = ([value, ms]) => limit(async () => {
    await delay(ms);
    return value;
  });

  assert.deepEqual(await Promise.all(input.map(mapper)), [10, 20, 30]);
  assert.ok(isInRange(end(), { start: 590, end: 650 }));
});

test('concurrency: 4', async () => {
  const concurrency = 5;
  let running = 0;

  const limit = asyncLimit(concurrency);

  const input = Array.from({ length: 100 }, () => limit(async () => {
    running++;
    assert.ok(running <= concurrency);
    await delay(randomInt(30, 200));
    running--;
  }));

  await Promise.all(input);
});

test('propagates async execution context properly', async () => {
  const concurrency = 2;
  const limit = asyncLimit(concurrency);
  const store = new AsyncLocalStorage();

  const checkId = async (id) => {
    await Promise.resolve();
    assert.strictEqual(id, store.getStore()?.id);
  };

  const startContext = async (id) => store.run({ id }, () => limit(checkId, id));

  await Promise.all(Array.from({ length: 100 }, (_, id) => startContext(id)));
});

test('non-promise returning function', async () => {
  const limit = asyncLimit(1);
  await assert.doesNotReject(async () => {
    await limit(() => null);
  });
});

test('continues after sync throw', async () => {
  const limit = asyncLimit(1);
  let ran = false;

  const promises = [
    limit(() => {
      throw new Error('err');
    }),
    limit(() => {
      ran = true;
    }),
  ];

  await Promise.allSettled(promises);
  assert.strictEqual(ran, true);
});

test('accepts additional arguments', async () => {
  const limit = asyncLimit(1);
  const symbol = Symbol('test');
  await limit((a) => assert.strictEqual(a, symbol), symbol);
});

test('does not ignore errors', async () => {
  const limit = asyncLimit(1);
  const error = new Error('🦄');

  const promises = [
    limit(async () => delay(30)),
    limit(async () => {
      await delay(80);
      throw error;
    }),
    limit(async () => delay(50)),
  ];

  await assert.rejects(() => Promise.all(promises), error);
});

test('activeCount and pendingCount properties', async () => {
  const limit = asyncLimit(5);
  assert.strictEqual(limit.activeCount, 0);
  assert.strictEqual(limit.pendingCount, 0);

  const runningPromise1 = limit(() => delay(1000));
  assert.strictEqual(limit.activeCount, 0);
  assert.strictEqual(limit.pendingCount, 1);

  await Promise.resolve();
  assert.strictEqual(limit.activeCount, 1);
  assert.strictEqual(limit.pendingCount, 0);

  await runningPromise1;
  assert.strictEqual(limit.activeCount, 0);
  assert.strictEqual(limit.pendingCount, 0);

  const immediate = Array.from({ length: 5 }, () => limit(() => delay(1000)));
  const delayed = Array.from({ length: 3 }, () => limit(() => delay(1000)));

  await Promise.resolve();
  assert.strictEqual(limit.activeCount, 5);
  assert.strictEqual(limit.pendingCount, 3);

  await Promise.all(immediate);
  assert.strictEqual(limit.activeCount, 3);
  assert.strictEqual(limit.pendingCount, 0);

  await Promise.all(delayed);
  assert.strictEqual(limit.activeCount, 0);
  assert.strictEqual(limit.pendingCount, 0);
});

test('clearQueue', async () => {
  const limit = asyncLimit(1);
  Array.from({ length: 1 }, () => limit(() => delay(1000)));
  Array.from({ length: 3 }, () => limit(() => delay(1000)));

  await Promise.resolve();
  assert.strictEqual(limit.pendingCount, 3);
  limit.clearQueue();
  assert.strictEqual(limit.pendingCount, 0);
});

test('throws on invalid concurrency argument', () => {
  assert.throws(() => asyncLimit(0));
  assert.throws(() => asyncLimit(-1));
  assert.throws(() => asyncLimit(1.2));
  assert.throws(() => asyncLimit(undefined));
  assert.throws(() => asyncLimit(true));
});

test('change concurrency to smaller value', async () => {
  const limit = asyncLimit(4);
  let running = 0;
  const log = [];

  const promises = Array.from({ length: 10 }).map(() =>
    limit(async () => {
      running++;
      log.push(running);
      await delay(50);
      running--;
    }),
  );

  await delay(0);
  assert.strictEqual(running, 4);

  limit.concurrency = 2;
  await Promise.all(promises);

  assert.deepEqual(log, [1, 2, 3, 4, 2, 2, 2, 2, 2, 2]);
});

test('change concurrency to bigger value', async () => {
  const limit = asyncLimit(2);
  let running = 0;
  const log = [];

  const promises = Array.from({ length: 10 }).map(() =>
    limit(async () => {
      running++;
      log.push(running);
      await delay(50);
      running--;
    }),
  );

  await delay(0);
  assert.strictEqual(running, 2);

  limit.concurrency = 4;
  await Promise.all(promises);

  assert.deepEqual(log, [1, 2, 3, 4, 4, 4, 4, 4, 4, 4]);
});

test('asyncLimitFn()', async () => {
  const concurrency = 5;
  let running = 0;

  const limitedFn = asyncLimitFn(async () => {
    running++;
    assert.ok(running <= concurrency);
    await delay(randomInt(30, 200));
    running--;
  }, { concurrency });

  const input = Array.from({ length: 100 }, limitedFn);
  await Promise.all(input);
});
