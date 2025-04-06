# Async helpers

>
> INSPIRATE ON [p-limit](https://github.com/sindresorhus/p-limit) OF Sindre Sorhus
>

@comodinx/promise-helpers is a module for optimize promise usage.

## Index

* [Download & Install][install].
* [How is it used?][how_is_it_used].
* [Tests][tests].

## Download & Install

### NPM
```bash
$ npm i @comodinx/async-helpers
```

### Source code
```bash
$ git clone https://gitlab.com/comodinx/async-helpers.git
$ cd async-helpers
$ npm i
```

## How is it used?

> Run multiple promise-returning & async functions with limited concurrency

### asyncLimit

```js
import { asyncLimit } from "@comodinx/async-helpers";

const limit = asyncLimit(1);

const input = [
	limit(() => fetchSomething('foo')),
	limit(() => fetchSomething('bar')),
	limit(() => doSomething())
];

// Only one promise is run at once
const result = await Promise.all(input);
console.log(result);
```

### asyncLimitFn

```js
import { asyncLimitFn } from "@comodinx/async-helpers";

const limitedFunction = asyncLimitFn(async () => {
	return doSomething();
}, {concurrency: 1});

const input = Array.from({length: 10}, limitedFunction);

// Only one promise is run at once.
await Promise.all(input);
```
