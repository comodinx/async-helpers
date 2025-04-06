import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { asyncLimit } from "./limit";

describe("promise all limit", () => {
  it("promise all limit", () => {
    const limit = asyncLimit(1);

    const input = [
      limit(async () => "foo"),
      limit(async () => "bar"),
      limit(async () => undefined),
    ];

    assert(Promise.all(input));

    assert(limit((_a) => "", "test"));
    assert(limit(async (_a, _b) => "", "test", 1));
  });
});
