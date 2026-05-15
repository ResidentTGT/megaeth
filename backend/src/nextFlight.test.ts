import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decodeNextFlight,
  extractJsonArrayMatching,
  extractJsonArrayStartingWith,
  extractJsonObject,
} from "./nextFlight.js";

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
    '{"entries":{"all":[{"displayName":"0x{abc}"}],"weekly":[]}}',
    "entries"
  );

  assert.deepEqual(result, {
    all: [{ displayName: "0x{abc}" }],
    weekly: [],
  });
});

test("extractJsonObject fails when key is missing", () => {
  assert.throws(
    () => extractJsonObject('{"payload":{}}', "entries"),
    /Cannot find "entries"/
  );
});

test("extractJsonArrayStartingWith extracts the surrounding array", () => {
  const result = extractJsonArrayStartingWith(
    '{"other":[],"apps":[{"name":"One","items":[1,2]},{"name":"Two"}]}',
    '"name":"Two"'
  );

  assert.deepEqual(result, [
    { name: "One", items: [1, 2] },
    { name: "Two" },
  ]);
});

test("extractJsonArrayMatching extracts an array by shape", () => {
  const result = extractJsonArrayMatching(
    '{"other":[{"name":"Noise"}],"apps":[{"id":"1","name":"One"},{"id":"2","name":"Two"}]}',
    (value) =>
      Array.isArray(value) &&
      value.length === 2 &&
      value.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "name" in item
      ),
    "objects with id and name"
  );

  assert.deepEqual(result, [
    { id: "1", name: "One" },
    { id: "2", name: "Two" },
  ]);
});
