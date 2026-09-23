const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");

test("Cloudflare deploy configuration excludes repository metadata", () => {
  const config = JSON.parse(
    fs.readFileSync(path.join(root, "wrangler.json"), "utf8"),
  );
  const ignoredAssets = fs.readFileSync(
    path.join(root, ".assetsignore"),
    "utf8",
  );

  assert.equal(config.assets.directory, ".");
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
  assert.match(ignoredAssets, /^\.git\/$/m);
  assert.match(ignoredAssets, /^\.claude\/$/m);
  assert.match(ignoredAssets, /^tests\/$/m);
});
