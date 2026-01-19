# Guide for Developing the Package

This document outlines the necessary steps to configure your development environment, publish releases, and offers additional helpful information for working with the package.

# Table of Contents

1. [Installation](#installation)
2. [Setting Up Your Development Environment](#setting-up-your-development-environment)
3. [Publishing Releases](#publishing-releases)
   - [Publish a Version](#publish-a-version)
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

The release process is divided into distinct stages to ensure a smooth and error-free deployment. Initially, a beta version of the package is released and the demo applications are accordingly updated. This is followed by rigorous testing of the demo app to verify that the beta version operates as intended. Upon successful completion of the testing phase, the final step is to publish the release version.

1. [Publish a Version](#publish-a-version)

## Publish a Version

Whether you're publishing a beta version or a new release, the process consists of several common steps with slight variations depending on the version type.

> TODO: automate this process with a plugin.

### Step-by-step guide

#### 1. Update Versions

Update the version of the packages in the following order, one at a time:

 1. `@tonconnect/isomorphic-eventsource`
 2. `@tonconnect/isomorphic-fetch`
 3. `@tonconnect/protocol`
 4. `@tonconnect/sdk`
 5. `@tonconnect/ui`
 6. `@tonconnect/ui-react`

Only update the packages that have changes or are below another package in this list that has changes. If a package has no changes and is above a package with changes, it does not need to be updated.

If a package depends on another, update the dependency version and make a "chore" commit before moving on to the next package.

We use `changesets` to manage versions. It automatically updates all affected packages, so you only need to select packages that were updated, all dependencies will receive updates automatically.

For example, if changes were made in `@tonconnect/ui`, you should run `pnpm changeset add`, select `@tonconnect/ui`, choose type of the version update(MAJOR.MINOR.PATCH) and write changelog. After you are done with `add` command, you need to run `pnpm changeset version`, which will update `package.json` and `CHANGELOG.md` for relevant packages. `@tonconnect/ui-react` will be updated automatically.
For beta version you need to run `pnpm changeset pre enter beta` before executing `add` and `version` commands. After you're done with releasing beta tag, you can exit pre mode by running `pnpm changeset pre exit`

> Note: Follow this [link](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md) to learn more about `changesets`.

#### 2. Build Packages

After updating the version, build all packages:

```shell
pnpm build
```

#### 3. Publish Version

Next, publish the version of the package. For `@tonconnect/ui`:

- For a beta version:
  ```shell
  cd packages/ui && pnpm publish --access=public --tag=beta
  ```
- For a new release:
  ```shell
  cd packages/ui && pnpm publish --access=public
  ```
- You can publish all updated packages by running:
  ```shell
  pnpm publish -r --access=public
  ```

> Note: The `--tag=beta` is used to publish the package with the `beta` tag to prevent accidental installation of the beta version.

#### 4. Push Changes

After publishing the version of `@tonconnect/ui`, push the commit and tags:

```shell
 git push origin HEAD
 git push origin --tags
```

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
