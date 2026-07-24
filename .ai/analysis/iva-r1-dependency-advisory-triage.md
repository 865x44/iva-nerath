# Iva r1 dependency advisory triage

Evidence base: `feature/deployable-r1` before the final r1 verification commit.
Reviewed: 2026-07-24. Scope: `npm audit --json --package-lock-only`.

No `npm audit fix` was run.

| Package | Advisory | Path / owner | Resolution |
|---|---|---|---|
| `brace-expansion@5.0.6` | high, GHSA-3jxr-9vmj-r5cp | transitive through `minimatch@10.2.5` | Update the lock-only resolution to patched `5.0.8`, which remains inside the declared `^5.0.5` range. |
| `fast-xml-parser@5.9.3` | high, GHSA-8r6m-32jq-jx6q | transitive through `just-bash@3.0.2` | Update the lock-only resolution to patched `5.10.1`, which remains inside the declared `^5.7.3` range. |

Acceptance:

- perform only the two named lockfile updates;
- inspect the resulting lock diff;
- run `npm ci`, the full baseline verification command, and a fresh
  package-lock-only audit;
- do not change direct dependency ranges or apply unrelated upgrades.

Observed lock result:

- `brace-expansion` resolved to `5.0.8`;
- `fast-xml-parser` resolved to `5.10.1`, including its declared updated
  transitive closure (`@nodable/entities`, `is-unsafe`,
  `path-expression-matcher`, and nested `xml-naming`);
- npm `10.9.7` normalized optional-package metadata and the root package
  version from stale `0.2.5` to `0.3.0`;
- the post-update package-lock-only audit reports zero known advisories.
