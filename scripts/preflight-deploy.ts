/**
 * Runs before `npm run deploy` / `npm run cf:deploy`. Collects the git and
 * wrangler facts and hands them to `evaluateDeployPreflight`, which owns the
 * decision and is unit-tested.
 *
 * It cannot cover a bare `npx wrangler deploy` — wrangler has no pre-deploy
 * hook — so RELEASE.md names `npm run deploy` as the deploy command. Anyone
 * reaching for wrangler directly is choosing to skip this.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { evaluateDeployPreflight } from "../src/lib/deploy-preflight.ts";

function git(args: string[]): string {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).replace(/^HEAD$/, "");
const upstream = branch
  ? git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"])
  : "";

// Without this the behind-count is whatever the last fetch happened to know,
// which is exactly the blind spot that let the reverted release through.
if (upstream) {
  try {
    execFileSync("git", ["fetch", "--quiet", "origin"], { stdio: "ignore" });
  } catch {
    console.warn("[preflight] could not reach origin; comparing against the last known state.");
  }
}

const behind = upstream
  ? Number(git(["rev-list", "--count", `HEAD..${upstream}`]) || "0")
  : 0;

const dirtyPaths = git(["diff", "--name-only", "HEAD"])
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

// The working tree's config, because that is the file wrangler itself will
// read — not `git show HEAD:...`, which would miss exactly the case where the
// checked-out config has drifted. `wrangler deploy --dry-run` was tried first
// and does not print the worker name at all; it only costs a full build.
const config = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8")
  .split("\n")
  .filter((line) => !/^\s*\/\//.test(line))
  .join("\n");
const workerName = /"name"\s*:\s*"([^"]+)"/.exec(config)?.[1] ?? "unknown";

const result = evaluateDeployPreflight({
  branch,
  upstream,
  behind,
  dirtyPaths,
  workerName,
  overridden: process.env.ALLOW_STALE_DEPLOY === "1",
});

for (const note of result.notes) console.log(`[preflight] ${note}`);

if (!result.ok) {
  console.error("\n[preflight] Refusing to deploy:\n");
  for (const failure of result.failures) console.error(`  ✖ ${failure}\n`);
  console.error(
    "  `wrangler deploy` uploads the working tree, not the branch. Set ALLOW_STALE_DEPLOY=1 only if\n" +
      "  you have decided that this tree, exactly as it is, belongs in production.\n",
  );
  process.exit(1);
}

console.log("[preflight] tree matches the branch — deploying.\n");
