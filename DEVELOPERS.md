# Guide for Developing the Package

This document outlines the necessary steps to configure your development environment, publish releases, and offers additional helpful information for working with the package.

# Table of Contents

1. [Installation](#installation)
2. [Setting Up Your Development Environment](#setting-up-your-development-environment)
3. [Publishing Releases](#publishing-releases)
4. [Additional Information](#additional-information)

# Installation

The first step in setting up your development environment is cloning the repository and navigating to the project's root directory.

```shell
git clone git@github.com:ton-connect/sdk.git && cd sdk
```

Next, install all dependencies using the following command:

```shell
pnpm i --frozen-lockfile
```

> Note: The `pnpm i --frozen-lockfile` installs dependencies based on the `package-lock.json` file, ensuring consistent versions as in the repository, and prevents any automatic updates.

# Setting Up Your Development Environment

Before starting development, you need to build all packages:

```shell
pnpm build
```

# Publishing Releases

## Branches

| Branch | Purpose |
|--------|---------|
| **develop** | Main development branch. All pull requests are opened into develop. |
| **main** | Production. Only release PRs are merged into main. |

---

## Beta and production releases

Beta (`2.4.0-beta.1`) and production (`2.4.0`) use the same process. The only differences are the versions in `package.json` and the npm tag used by CI (`beta` or `latest`).

### 1. Development in develop

- All features and fixes are merged into **develop** via PRs.
- Do not open PRs into main (except release PRs; see below).

### 2. Preparing a release branch

When develop has accumulated changes ready for release:

1. **Branch off from develop** into a release-tagged branch, for example:
   - `release/2.4.0-beta.1` — for beta
   - `release/2.4.0` — for stable

2. **Create a commit that bumps versions** only for packages that actually changed.
   Order (when dependencies apply):
   `@tonconnect/isomorphic-eventsource` → `@tonconnect/isomorphic-fetch` → `@tonconnect/protocol` → `@tonconnect/sdk` → `@tonconnect/ui` → `@tonconnect/ui-react`.

   You can use `pnpm changeset add` and `pnpm changeset version` (for beta, run `pnpm changeset pre enter beta` first; when done, `pnpm changeset pre exit`).

   > See [changesets](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md) for more.

3. **Open a PR** from `release/X.Y.Z` (or `release/X.Y.Z-beta.N`) **into main**.

### 3. Merge into main and Release workflow

- After review, the PR is merged into **main**.
- A push to **main** triggers the **Release** workflow (which also runs on **develop**; behaviour depends on the branch).

### 4. What the Release workflow does (main path)

1. **Lint → Build → Test** — run first; if any step fails the release is aborted.

2. **Compare versions with npm**
   For each non-private package, the local version is compared to `npm view <pkg> version`.
   - If **all versions already match npm** — nothing to release, job exits cleanly.

3. **Major version guard**
   If any package's major is higher than on npm the job **fails**.
   Major releases are always done manually.

4. **If there are new versions and no major bump:**
   - Create and push git tags (`<pkg>@<version>` per package + `v<version>` root tag)
   - Publish to npm via `pnpm publish --provenance` (GitHub Trusted Publishing / OIDC — no token needed)
     - version contains `beta` → npm tag **`beta`**
     - otherwise → npm tag **`latest`**
   - Create a GitHub Release (marked as pre-release when beta)
   - **Auto-merge `main` → `develop`** to pull the bumped versions back.
     If the merge has conflicts, a PR `ci/merge-main-into-develop-{hash}` is opened automatically instead of failing.

### 5. Result

After a successful release **develop** is automatically up-to-date with `main`. Development continues in `develop`.

---

## Dev release

- **Trigger:** every push to `develop` (same `release.yml`, dev-specific path).
- **Version format:** `{major}.{minor+1}.{patch}-dev.{YYYYMMDDHHMMSS}.{short-hash}`
  Example: current `2.4.0` → published as `2.5.0-dev.20260223143000.a1b2c3d`
- Published via `pnpm publish --tag dev --provenance` (GitHub Trusted Publishing / OIDC — no token needed).
- Private packages are skipped automatically.
- A commit comment is posted listing all published packages.

Install with: `npm install <package>@dev`.

---

## Flow diagram

```
feature/fix branches
   └── PR ──► develop
                │  (test-build.yml: lint + build + test on every PR / non-release push)
                │
                ├── push ──► release.yml  [develop path]
                │             ├── lint + build + test
                │             ├── version: {major}.{minor+1}.{patch}-dev.{DATE}.{HASH}
                │             ├── git tags  →  push tags
                │             ├── pnpm publish --tag dev --provenance
                │             └── commit comment with published packages
                │
                ├── release/X.Y.Z[-beta.N]   (branch off develop, bump versions, open PR)
                │         │
                │         └── PR ──► main
                │                      │
                │                      └── push ──► release.yml  [main path]
                │                                    ├── lint + build + test
                │                                    ├── compare versions with npm
                │                                    │     all match?  → skip
                │                                    │     major bump? → fail
                │                                    ├── git tags  →  push tags
                │                                    ├── pnpm publish --provenance
                │                                    │     beta in version → --tag beta
                │                                    │     otherwise       → --tag latest
                │                                    ├── GitHub Release (prerelease if beta)
                │                                    └── auto-merge main ──► develop
                │                                          conflict? → open PR instead
                │
                ◄──────────── auto-merge / PR after release ──────────────────────────┘
```

---

## Limits

- **Major versions** are not allowed via CI. If the major is bumped the Release workflow fails. Do major releases manually.
- The **first publish** of a brand-new package must be done manually — npm Trusted Publishing only works for packages that already exist on the registry.

# Additional Information

## CDN Access

You can access the package via CDN at the following URL: [https://unpkg.com/@tonconnect/sdk@latest/dist/tonconnect-sdk.min.js](https://unpkg.com/@tonconnect/sdk@latest/dist/tonconnect-sdk.min.js).

## Demo DApps

The package can be tested using the following demo DApps:

- [demo-dapp-with-react-ui](apps/demo-dapp-with-react-ui): Demo dapp that comes as a part of the monorepo. Automatically uses local versions of the packages

- [demo-dapp-with-wallet](https://github.com/ton-connect/demo-dapp-with-wallet): Currently utilized for testing beta versions. It needs to be replaced with demo-dapp-with-react-ui.

- [demo-dapp](https://github.com/ton-connect/demo-dapp): Currently outdated. It requires an update.

## Documentation Generation

The documentation for this package is generated using [typedoc](https://typedoc.org/). It is automatically generated and updated by Vercel whenever a new commit is pushed to the `main` branch.

## React Native Compatibility

Please note that the package is currently not compatible with React Native. This issue is expected to be addressed in future updates.
