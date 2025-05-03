# Guide for Developing the Package

This document outlines the necessary steps to configure your development environment, publish releases, and offers additional helpful information for working with the package.

# Table of Contents

1. [Installation](#installation)
2. [Setting Up Your Development Environment](#setting-up-your-development-environment)
3. [Publishing Releases](#publishing-releases)
   - [Publish a Version](#publish-a-version)
   - [Update the Demo App](#update-the-demo-app)
4. [Additional Information](#additional-information)

# Installation

The first step in setting up your development environment is cloning the repository and navigating to the project's root directory.

```shell
git clone git@github.com:ton-connect/sdk.git && cd sdk
```

Next, install all dependencies using the following command:

```shell
npm ci
```

> Note: The `npm ci` installs dependencies based on the `package-lock.json` file, ensuring consistent versions as in the repository, and prevents any automatic updates.

# Setting Up Your Development Environment

Before starting development, you need to build all packages:

```shell
nx run-many --target=build --all --parallel=1
```

> Note: The `--parallel=1` flag ensures packages are built one after the other to avoid potential errors caused by package dependencies.

Next, link the `@tonconnect/ui-react` package to your project:

```shell
cd packages/ui-react && npm link
```

Then, in your [demo dapp](#demo-dapps) directory, run:

```shell
npm link @tonconnect/ui-react
```

Replace the `build` script in `packages/ui/package.json` with the following:

```json
{
  "scripts": {
    "build": "tsc --noEmit --emitDeclarationOnly false && vite build"
  }
}
```

> ⚠️ Warning: Patch your `packages/ui/package.json` file as above to ensure watch mode functions correctly during the build process. Remember to revert this patch before releasing a new version. This is a temporary workaround and will be addressed in future updates.

Now, build the `@tonconnect/ui-react` package in watch mode:

```shell
nx affected:build --parallel=1 --watch
```

> Note: As before, `--parallel=1` is used to build packages sequentially, preventing errors due to interdependencies.

Finally, run your project in watch mode and start developing!

# Publishing Releases

The release process is divided into distinct stages to ensure a smooth and error-free deployment. Initially, a beta version of the package is released and the demo applications are accordingly updated. This is followed by rigorous testing of the demo app to verify that the beta version operates as intended. Upon successful completion of the testing phase, the final step is to publish the release version.

1. [Publish a Version](#publish-a-version)
2. [Update the Demo App](#update-the-demo-app)

## Publish a Version

Whether you're publishing a beta version or a new release, the process consists of several common steps with slight variations depending on the version type.

> TODO: automate this process with an nx plugin.

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

For example, if changes were made in `@tonconnect/ui` and `@tonconnect/ui-react`, you should first run the following for `@tonconnect/ui`:

 - For a beta version:
   ```shell
   nx run ui:version --releaseAs=prerelease --preid=beta
   ```
 - For a new release:
   ```shell
   nx run ui:version --releaseAs=patch
   ```

> Note: Follow this [link](https://github.com/jscutlery/semver#specify-the-level-of-change) to learn more about `--releaseAs` and `--preid`.

#### 2. Build Packages

After updating the version, build all packages:

 ```shell
 nx run-many --target=build --all --parallel=1
 ```

> Note: The `--parallel=1` is used to build packages one by one since some packages depend on each other, and parallel building may result in errors.

#### 3. Publish Version

Next, publish the version of the package. For `@tonconnect/ui`:

- For a beta version:
  ```shell
  cd packages/ui && npm publish --access=public --tag=beta
  ```
- For a new release:
  ```shell
  cd packages/ui && npm publish --access=public
  ```

> Note: The `--tag=beta` is used to publish the package with the `beta` tag to prevent accidental installation of the beta version.

#### 4. Push Changes

After publishing the version of `@tonconnect/ui`, push the commit and tags:

 ```shell
 git push origin HEAD
 git push origin --tags
 ```

#### 5. Update Dependencies for Next Package (if needed)

After publishing the version of `@tonconnect/ui`, update its version in the `dependencies` section of `@tonconnect/ui-react`'s `package.json` file.

 ```json
 /* file: packages/ui-react/package.json */
 {
   "dependencies": {
     "@tonconnect/ui": "CURRENT_VERSION"
   }
 }
 ```

> TODO: add a step to run `npm install` in `@tonconnect/ui-react` for updating `package-lock.json` file when the step will be tested.

Then, create a "chore" commit to save this change:

 ```shell
 git add packages/ui-react/package.json
 git commit -m "chore(ui-react): update @tonconnect/ui to CURRENT_VERSION"
 ```

#### 6. Repeat Steps for Next Package (if needed)

After publishing the version, repeat the [above steps](#publish-a-version) for the next package in the list, e.g. `@tonconnect/ui-react`.

#### 7. Update Demo App

If you're publishing a new release, make sure to update the demo app as well. Please refer to the [Update the demo app](#update-the-demo-app) section for more details.

## Update the demo app

> TODO: automate this process with the GitHub Actions.

### Step-by-step guide

#### 1. Clone Repository

If you don't have the [demo-dapp-with-wallet](https://github.com/ton-connect/demo-dapp-with-wallet) repository, clone it:

```shell
git clone git@github.com:ton-connect/demo-dapp-with-wallet.git && cd demo-dapp-with-wallet
```

> TODO: replace with demo-dapp-with-react-ui repository when it will be updated.

#### 2. Update Package Version

Update the `@tonconnect/ui-react` package version in the `package.json` file:

```json
{
  "dependencies": {
    "@tonconnect/ui-react": "CURRENT_VERSION"
  }
}
```

#### 3. Install Dependencies

Install the necessary dependencies and update the `package-lock.json` file:

```shell
npm install
```

#### 4. Build and Test

Build the demo app and check if it works correctly:

```shell
npm run build
```

#### 5. Commit and Push Changes

Commit the changes and push them to the repository, this will update the GitHub pages:

```shell
git add . && git commit -m "chore: update @tonconnect/ui-react to CURRENT_VERSION" && git push origin HEAD
```

> Caution: Be careful when updating any demo apps, as they are used for testing by the community.

After updating the demo app, test the beta version of the package in the [demo app](https://ton-connect.github.io/demo-dapp-with-wallet/). If everything works correctly, you are ready to publish a new release. **Don't forget to repeat the steps for the release version.**

> Note: Currently, the beta version is tested on the [demo-dapp-with-wallet](https://github.com/ton-connect/demo-dapp-with-wallet). However, it is recommended to also update the [demo-dapp-with-react-ui](https://github.com/ton-connect/demo-dapp-with-react-ui) and use it for testing.

# Additional Information

## CDN Access

You can access the package via CDN at the following URL: [https://unpkg.com/@tonconnect/sdk@latest/dist/tonconnect-sdk.min.js](https://unpkg.com/@tonconnect/sdk@latest/dist/tonconnect-sdk.min.js).

## Demo DApps

The package can be tested using the following demo DApps:

- [demo-dapp-with-wallet](https://github.com/ton-connect/demo-dapp-with-wallet): Currently utilized for testing beta versions. It needs to be replaced with demo-dapp-with-react-ui.
- [demo-dapp-with-react-ui](https://github.com/ton-connect/demo-dapp-with-react-ui): Currently outdated. It requires an update following the release publication.
- [demo-dapp](https://github.com/ton-connect/demo-dapp): Currently outdated. It requires an update.

## Documentation Generation

The documentation for this package is generated using [typedoc](https://typedoc.org/). It is automatically generated and updated by GitHub Actions whenever a new commit is pushed to the `main` branch.

## React Native Compatibility

Please note that the package is currently not compatible with React Native. This issue is expected to be addressed in future updates.

