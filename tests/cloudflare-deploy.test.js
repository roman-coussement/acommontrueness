const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");

test("Cloudflare deploys only the generated site on both custom domains", () => {
  const config = JSON.parse(
    fs.readFileSync(path.join(root, "wrangler.json"), "utf8"),
  );

  assert.equal(config.assets.directory, "./dist");
  assert.deepEqual(config.routes, [
    {
      pattern: "acommontrueness.com/*",
      zone_name: "acommontrueness.com",
    },
    {
      pattern: "www.acommontrueness.com/*",
      zone_name: "acommontrueness.com",
    },
  ]);
});
