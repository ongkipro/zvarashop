/**
 * `wrangler deploy` uploads the **working tree**, not the branch.
 *
 * That is easy to forget and it has already cost this install a release: on
 * 2026-08-28 a verified fix was deployed at 14:37 WIB and silently reverted at
 * 15:13 by a deploy from a clone that had not pulled it. Nothing failed. The
 * commit stayed on `origin/install/zvarashop`, both deploys reported success,
 * and production quietly ran code that was two commits old — for the tracking
 * layer specifically, that means conversions degrade with no error anywhere.
 *
 * So the check is not "is the code good" — CI answers that. It is "is the tree
 * about to be uploaded actually the branch everyone agreed on".
 *
 * Pure on purpose: the caller collects the git and wrangler facts, this decides.
 * That keeps the decision testable without a repository or a network.
 */

/** The placeholder identity `wrangler.jsonc` ships with, per RELEASE.md §7. */
export const PLACEHOLDER_WORKER_NAME = "adsbookcms-your-store";

export type DeployPreflightState = {
  /** Branch at HEAD, or "" when detached. */
  branch: string;
  /** Its upstream, e.g. `origin/install/zvarashop`, or "" when untracked. */
  upstream: string;
  /** Commits the upstream has that HEAD does not. The reverted-release case. */
  behind: number;
  /** Tracked paths with uncommitted modifications. Untracked files are fine. */
  dirtyPaths: string[];
  /** Worker name wrangler resolved for this deploy. */
  workerName: string;
  /** `ALLOW_STALE_DEPLOY=1` — a deliberate, stated exception. */
  overridden: boolean;
};

export type DeployPreflightResult = {
  ok: boolean;
  /** Empty when ok. Each entry is a sentence a human can act on. */
  failures: string[];
  /** Non-blocking notes, always reported. */
  notes: string[];
};

export function evaluateDeployPreflight(
  state: DeployPreflightState,
): DeployPreflightResult {
  const failures: string[] = [];
  const notes: string[] = [];

  if (state.workerName === PLACEHOLDER_WORKER_NAME) {
    // Not overridable. There is no situation in which shipping an install as
    // the product's placeholder is what someone meant.
    return {
      ok: false,
      failures: [
        `wrangler resolved the worker name "${PLACEHOLDER_WORKER_NAME}", which is the product placeholder. ` +
          `A merge or a sync has overwritten this install's wrangler.jsonc — restore it before deploying.`,
      ],
      notes,
    };
  }

  if (!state.branch) {
    failures.push(
      "HEAD is detached, so there is no branch to compare against. Check out the install branch first.",
    );
  } else if (!state.upstream) {
    failures.push(
      `Branch "${state.branch}" tracks no remote, so a stale tree cannot be detected. Set an upstream first.`,
    );
  } else if (state.behind > 0) {
    failures.push(
      `HEAD is ${state.behind} commit${state.behind === 1 ? "" : "s"} behind ${state.upstream}. ` +
        `Deploying now uploads this tree and reverts whatever those commits changed — run \`git pull --ff-only\` first.`,
    );
  }

  if (state.dirtyPaths.length > 0) {
    const shown = state.dirtyPaths.slice(0, 5).join(", ");
    const rest = state.dirtyPaths.length > 5 ? `, +${state.dirtyPaths.length - 5} more` : "";
    failures.push(
      `${state.dirtyPaths.length} tracked file${state.dirtyPaths.length === 1 ? " has" : "s have"} uncommitted changes (${shown}${rest}). ` +
        `Whatever is on disk is what ships, so commit it or stash it — do not let production hold code no branch records.`,
    );
  }

  notes.push(`Target worker: ${state.workerName}`);
  if (state.upstream) notes.push(`Tree: ${state.branch} against ${state.upstream}`);

  if (failures.length > 0 && state.overridden) {
    return {
      ok: true,
      failures: [],
      notes: [
        ...notes,
        "ALLOW_STALE_DEPLOY=1 — proceeding despite:",
        ...failures.map((failure) => `  - ${failure}`),
      ],
    };
  }

  return { ok: failures.length === 0, failures, notes };
}
