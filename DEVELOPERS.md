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

### 4. What the Release workflow does

1. **Compare with npm**  
   For each package, the repo version is compared to the version on npm (`npm view <pkg> version`).  
   - If **all versions match npm** — no release is performed; the job finishes.

2. **Major version check**  
   If a package’s **major version in the repo is higher than on npm**, the job fails.  
   **Major releases are done only manually**, not through this CI.

3. **If there are differences and the major has not been increased:**  
   - Lint, build, tests  
   - Create git tags  
   - Publish to npm (OIDC; tag `beta` or `latest` based on the version)  
   - Create a GitHub Release  
   - **Merge main into develop**

### 5. Result

After a successful Release workflow, **develop** is automatically updated with all commits from **main**. Development then continues in develop.

---

## Dev release

- **Trigger:** every **push to develop** (same **Release** workflow file; behaviour is dev-specific on this branch).
- **Behavior:** for each package, the version is set to `(current minor+1).X.X-dev.DATE.HASH` and published to npm with the **`dev`** tag.
- No PR into main is required. A dev release is produced on every commit to develop.

Install with: `npm install <package>@dev`.

---

## Flow diagram

```
develop  ◄── PRs (features, fixes)
   │
   ├── release/X.Y.Z-beta.N  (branch from develop + version bumps)
   │         │
   │         └── PR ──► main
   │                      │
   │                      ├── Release workflow: checks, publish to npm, GitHub Release
   │                      │
   │                      └── merge main ──► develop
   │
   └── push ──► Release workflow, dev path (publish @dev on every commit)
```

---

## Limits

- **Major versions** are not allowed in the Release workflow. The job fails if the major is increased. Major releases are done manually.
- The **first publish** of a new package to npm is done manually (Trusted Publishers only apply to packages that already exist).

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
