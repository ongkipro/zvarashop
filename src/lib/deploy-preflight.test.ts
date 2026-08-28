import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  evaluateDeployPreflight,
  PLACEHOLDER_WORKER_NAME,
  type DeployPreflightState,
} from "./deploy-preflight.ts";

const healthy: DeployPreflightState = {
  branch: "install/zvarashop",
  upstream: "origin/install/zvarashop",
  behind: 0,
  dirtyPaths: [],
  workerName: "zvarashop",
  overridden: false,
};

test("a tree that matches its branch deploys", () => {
  const result = evaluateDeployPreflight(healthy);
  assert.equal(result.ok, true);
  assert.deepEqual(result.failures, []);
  assert.ok(result.notes.some((note) => note.includes("zvarashop")));
});

test("a tree behind its upstream is refused, because deploying it reverts production", () => {
  // The failure this exists for. On 2026-08-28 a verified tracking fix was
  // deployed and then silently reverted 36 minutes later by a deploy from a
  // clone two commits behind. Both deploys reported success; the commit never
  // left the remote; production simply ran older code.
  const result = evaluateDeployPreflight({ ...healthy, behind: 2 });
  assert.equal(result.ok, false);
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /2 commits behind origin\/install\/zvarashop/);
  assert.match(result.failures[0], /git pull --ff-only/);
});

test("uncommitted tracked changes are refused, so production never holds code no branch records", () => {
  const result = evaluateDeployPreflight({
    ...healthy,
    dirtyPaths: ["src/pages/thanks.astro", "src/lib/meta-capi.ts"],
  });
  assert.equal(result.ok, false);
  assert.match(result.failures[0], /2 tracked files have uncommitted changes/);
  assert.match(result.failures[0], /thanks\.astro/);
});

test("a long dirty list is summarised rather than dumped", () => {
  const result = evaluateDeployPreflight({
    ...healthy,
    dirtyPaths: ["a", "b", "c", "d", "e", "f", "g"],
  });
  assert.match(result.failures[0], /\+2 more/);
});

test("the product placeholder is refused and cannot be overridden", () => {
  // RELEASE.md §7: if a sync overwrites the install's wrangler.jsonc, deploying
  // creates a stray Worker instead of updating the store. There is no reading
  // of "I meant that", so the override does not apply.
  for (const overridden of [false, true]) {
    const result = evaluateDeployPreflight({
      ...healthy,
      workerName: PLACEHOLDER_WORKER_NAME,
      overridden,
    });
    assert.equal(result.ok, false, `placeholder must be refused (overridden=${overridden})`);
    assert.match(result.failures[0], /product placeholder/);
  }
});

test("detached HEAD and an untracked branch are both refused", () => {
  const detached = evaluateDeployPreflight({ ...healthy, branch: "", upstream: "" });
  assert.equal(detached.ok, false);
  assert.match(detached.failures[0], /detached/);

  const untracked = evaluateDeployPreflight({ ...healthy, upstream: "" });
  assert.equal(untracked.ok, false);
  assert.match(untracked.failures[0], /tracks no remote/);
});

test("the override proceeds but states in full what it is overriding", () => {
  // A silent override would be worse than no check: the point is that the
  // record says production knowingly received a tree nobody's branch holds.
  const result = evaluateDeployPreflight({
    ...healthy,
    behind: 1,
    dirtyPaths: ["src/pages/thanks.astro"],
    overridden: true,
  });
  assert.equal(result.ok, true);
  assert.ok(result.notes.some((note) => note.includes("ALLOW_STALE_DEPLOY=1")));
  assert.ok(result.notes.some((note) => /1 commit behind/.test(note)));
  assert.ok(result.notes.some((note) => /uncommitted changes/.test(note)));
});

test("npm run deploy cannot skip the preflight", () => {
  // The guard is worth nothing if the documented deploy command bypasses it.
  const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };
  assert.equal(pkg.scripts.predeploy, "npm run preflight");
  assert.equal(pkg.scripts["precf:deploy"], "npm run preflight");
  assert.match(pkg.scripts.preflight, /scripts\/preflight-deploy\.ts/);
});
