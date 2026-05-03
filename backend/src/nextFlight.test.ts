import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeNextFlight, extractJsonObject } from "./nextFlight.js";

const encodeChunk = (value: string) => JSON.stringify(value).slice(1, -1);

test("decodeNextFlight joins escaped flight chunks", () => {
  const html = [
    `<script>self.__next_f.push([1,"${encodeChunk('{"entries":')}"])</script>`,
    `<script>self.__next_f.push([1,"${encodeChunk('{"all":[],"weekly":[]}}')}"])</script>`,
  ].join("");

  assert.equal(
    decodeNextFlight(html),
    '{"entries":{"all":[],"weekly":[]}}'
  );
});

test("extractJsonObject handles braces inside strings", () => {
  const result = extractJsonObject(
    '{"entries":{"all":[{"mainWalletAddress":"0x{abc}"}],"weekly":[]}}',
    "entries"
  );

  assert.deepEqual(result, {
    all: [{ mainWalletAddress: "0x{abc}" }],
    weekly: [],
  });
});

test("extractJsonObject fails when key is missing", () => {
  assert.throws(
    () => extractJsonObject('{"payload":{}}', "entries"),
    /Cannot find "entries"/
  );
});
