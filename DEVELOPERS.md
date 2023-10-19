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

> ⚠️ Warning: you need to patch your `packages/ui/package.json` file to make the build work in watch mode. It will be fixed in the future. 
 
Replace the `build` script in `packages/ui/package.json` file with the following:

```json
{
  "scripts": {
    "build": "tsc --noEmit --emitDeclarationOnly false && vite build"
  }
}
```

Then you can run the build of `@tonconnect/ui-react` package in watch mode:

```shell
nx affected:build --parallel=1 --watch
```

> Note: `--parallel=1` is used to build packages one by one, because some packages depend on each other, and if you build them in parallel, you can get errors.

Then you can run yours project in watch mode.
