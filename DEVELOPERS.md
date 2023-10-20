# Installation

Git clone this repository, and cd to the root directory of the project.

```shell
git clone git@github.com:ton-connect/sdk.git && cd sdk
```

Then install dependencies:

```shell
npm ci
```

> Note: `npm ci` is used instead of `npm i` to install dependencies from `package-lock.json` file to ensure that all dependencies are installed with the same versions as in the repository, and without any updates.

# Running

Before running the project, you need to build all packages:

```shell
nx run-many --target=build --all --parallel=1
```

> Note: `--parallel=1` is used to build packages one by one, because some packages depend on each other, and if you build them in parallel, you can get errors.

Then you can link `@tonconnect/ui-react` package to your project:

```shell
cd packages/ui-react && npm link && cd ../../ 
```

In your project directory, run:

```shell
npm link @tonconnect/ui-react
```
 
 
Replace the `build` script in `packages/ui/package.json` file with the following:
 
```json
{
  "scripts": {
    "build": "tsc --noEmit --emitDeclarationOnly false && vite build"
  }
}
```

> ⚠️ Warning: you need to patch your `packages/ui/package.json` file to make the build work in watch mode. **Don't forget to revert this patch before publishing a new release.** It will be fixed in the future.

Then you can run the build of `@tonconnect/ui-react` package in watch mode:

```shell
nx affected:build --parallel=1 --watch
```

> Note: `--parallel=1` is used to build packages one by one, because some packages depend on each other, and if you build them in parallel, you can get errors.

Then you can run yours project in watch mode.

# Publishing releases

## Publish a beta version

Before publishing a new release, you need to publish a beta version and update the demo apps.

> Note: follow to the link to learn more about [semver](https://github.com/jscutlery/semver).

Update the version of the package, **run only for the packages that you want to publish**. It will update the version in the `package.json` file, update the `CHANGELOG.md` file, and create a new commit:

```shell
nx run isomorphic-eventsource:version --releaseAs=prerelease --preid=beta
nx run isomorphic-fetch:version --releaseAs=prerelease --preid=beta
nx run protocol:version --releaseAs=prerelease --preid=beta
nx run sdk:version --releaseAs=prerelease --preid=beta
nx run ui:version --releaseAs=prerelease --preid=beta
nx run ui-react:version --releaseAs=prerelease --preid=beta
```

> TODO: automate this process with nx plugin.

> Note: follow to the link to learn more about [--releaseAs and --preid](https://github.com/jscutlery/semver#specify-the-level-of-change).

After the version is updated, you need to build all packages:

```shell
> nx run-many --target=build --all --parallel=1
```

> Note: `--parallel=1` is used to build packages one by one, because some packages depend on each other, and if you build them in parallel, you can get errors.

Then you can publish a beta version of the package, **run only for the packages that you want to publish**:

```shell
cd packages/isomorphic-eventsource && npm publish --access=public --tag=beta && cd ../../
cd packages/isomorphic-fetch && npm publish --access=public --tag=beta && cd ../../
cd packages/protocol && npm publish --access=public --tag=beta && cd ../../
cd packages/sdk && npm publish --access=public --tag=beta && cd ../../
cd packages/ui && npm publish --access=public --tag=beta && cd ../../
cd packages/ui-react && npm publish --access=public --tag=beta && cd ../../
```

> TODO: automate this process with nx plugin.

> Note: `--tag=beta` is used to publish the package with the `beta` tag to prevent accidental installation of the beta version.

Make sure that the beta version is published correctly, and push the changes:
```shell
git push origin HEAD
```

> Note: pushes to the `main` branch will trigger the update of the [documentation](https://ton-connect.github.io/sdk/) via GitHub Actions.

After the beta version is published, you need to update the [demo-dapp-with-wallet](https://github.com/ton-connect/demo-dapp-with-wallet).

## Update the demo app for testing

Download the [demo-dapp-with-wallet](https://github.com/ton-connect/demo-dapp-with-wallet) repository (if you already have it, then skip this step):
```shell
git clone git@github.com:ton-connect/demo-dapp-with-wallet.git && cd demo-dapp-with-wallet
```

Update the `@tonconnect/ui-react` package version in the `package.json` file:
```json
{
  "dependencies": {
    "@tonconnect/ui-react": "CURRENT_VERSION"
  }
}
```

Install dependencies:
```shell
npm install
```

Check that the demo app works correctly, and re-build it:
```shell
npm run build
```

Commit the changes and push changes to the repository, it will update github pages.

```shell
git add . && git commit -m "chore: update @tonconnect/ui-react to CURRENT_VERSION" && git push origin HEAD
```

After the demo app is updated, you can test the beta version of the package in the [demo app](https://ton-connect.github.io/demo-dapp-with-wallet/). If everything works correctly, you can publish a new release.

> TODO: now the beta version is tested on the [demo-dapp-with-wallet](https://github.com/ton-connect/demo-dapp-with-wallet), but it is better to update the [demo-dapp-with-react-ui](https://github.com/ton-connect/demo-dapp-with-react-ui) and use it for testing.

> Note: be careful when updating any demo apps, because they are used for testing by the community.

## Publish a new release

Update the version of the package, **run only for the packages that you want to publish**. It will update the version in the `package.json` file, update the `CHANGELOG.md` file, and create a new commit:

```shell
nx run isomorphic-eventsource:version --releaseAs=patch
nx run isomorphic-fetch:version --releaseAs=patch
nx run protocol:version --releaseAs=patch
nx run sdk:version --releaseAs=patch
nx run ui:version --releaseAs=patch
nx run ui-react:version --releaseAs=patch
```

> TODO: automate this process with nx plugin.

> Note: follow to the link to learn more about [--releaseAs](https://github.com/jscutlery/semver#specify-the-level-of-change).

Build all packages:
```shell
nx run-many --target=build --all --parallel=1
```

> Note: `--parallel=1` is used to build packages one by one, because some packages depend on each other, and if you build them in parallel, you can get errors.

Then you can publish a new release of the package, **run only for the packages that you want to publish**:

```shell
cd packages/isomorphic-eventsource && npm publish --access=public && cd ../../
cd packages/isomorphic-fetch && npm publish --access=public && cd ../../
cd packages/protocol && npm publish --access=public && cd ../../
cd packages/sdk && npm publish --access=public && cd ../../
cd packages/ui && npm publish --access=public && cd ../../
cd packages/ui-react && npm publish --access=public && cd ../../
```

Push the changes:
```shell
git push origin HEAD
```

> Note: pushes to the `main` branch will trigger the update of the [documentation](https://ton-connect.github.io/sdk/) via GitHub Actions.

After the release is published, you need to update the [demo-dapp-with-wallet](https://github.com/ton-connect/demo-dapp-with-wallet) again.

# Notes

## CDN

The package is available via CDN: https://unpkg.com/@tonconnect/sdk@latest/dist/tonconnect-sdk.min.js

## Demo dapps

Use the following demo dapps to test the package:

- [demo-dapp-with-wallet](https://github.com/ton-connect/demo-dapp-with-wallet) currently used for testing beta versions, must be replaced with demo-dapp-with-react-ui
- [demo-dapp-with-react-ui](https://github.com/ton-connect/demo-dapp-with-react-ui) outdated, must be updated after the release is published
- [demo-dapp](https://github.com/ton-connect/demo-dapp) outdated, must be updated

## Documentation

The documentation is generated by [typedoc](https://typedoc.org/). It is generated automatically by GitHub Actions when a new commit is pushed to the `main` branch.

## React Native

Currently, the package is not working in React Native. It should be fixed in the future.
