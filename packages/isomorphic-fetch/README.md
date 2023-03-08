# @tonconnect/isomorphic-fetch

This package provides `fetch` applicable in different environments (browser & NodeJS).

## Get started
`npm i @tonconnect/isomorphic-fetch`

## How to use
Just import the package and use global `fetch` function:

```ts
import '@tonconnect/isomorphic-fetch';

const result = await fetch('https://example.com');
```

That will work in both browser and NodeJS.

## How does it work
This package exports an empty script if bundler creates browser-compatible build.
When package is imported in NodeJS environment, it assigns an `fetch` imported from the `node-fetch` package to the `global` variable.

Note that this package doesn't provide an `fetch` polyfill for browsers which doesn't support `fetch` natively. 
