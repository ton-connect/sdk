# Release Process

## Overview

Releases are published **only from `release/*` branches** and require **manual approval** via the GitHub `Release` environment.

| npm tag    | Version pattern       | Branch example          | Use case                    |
| ---------- | --------------------- | ----------------------- | --------------------------- |
| `beta`     | `x.y.z-beta.N`       | `release/2.5.0-beta.1`  | Pre-release testing         |
| `latest`   | `x.y.z`              | `release/2.5.0`         | Stable production release   |

> `dev` publishing is not part of this workflow.

## How It Works

1. **Create a release branch** from `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b release/2.5.0-beta.1
   ```

2. **Bump versions** in the packages you want to publish using changesets or manually:
   ```bash
   pnpm changeset        # interactive version bump
   pnpm changeset version # apply changesets
   git add -A && git commit -m "chore: release 2.5.0-beta.1"
   ```

3. **Push the branch**:
   ```bash
   git push -u origin release/2.5.0-beta.1
   ```

4. **Trigger the workflow**: Go to **Actions → Release → Run workflow**, select your `release/*` branch, and click **Run workflow**.

5. **Approve the deployment**: A reviewer with access to the `Release` environment must approve the run. The workflow will wait for approval before publishing.

6. The workflow will:
   - Install, lint, build, and test
   - Compare each package version with npm — only changed packages are published
   - Detect the npm tag automatically from the version string (`-beta` → `beta`, `-rc` → `rc`, `-alpha` → `alpha`, otherwise `latest`)
   - Publish each changed package with the correct tag
   - Create git tags and a GitHub Release

## Safeguards

- **Approval required** — the `Release` GitHub environment must have protection rules with required reviewers.
- **`release/*` branches only** — the workflow will not run on `main`, `develop`, or feature branches.
- **No major bumps in CI** — major version increments are blocked; release them manually.
- **Idempotent** — packages already published at the same version are skipped.
- **Dry run** — set the `dry_run` input to `true` to validate without publishing.

## Promoting Beta to Stable

```bash
# 1. Create the stable release branch
git checkout release/2.5.0-beta.3
git checkout -b release/2.5.0

# 2. Remove pre-release suffixes from package.json versions
#    e.g. "2.5.0-beta.3" → "2.5.0"

# 3. Commit and push
git add -A && git commit -m "chore: release 2.5.0"
git push -u origin release/2.5.0

# 4. Trigger & approve the workflow from Actions tab
```
