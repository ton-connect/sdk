# @tonconnect/isomorphic-eventsource

This package provides `EventSource` applicable in different environments (browser & NodeJS).

## Get started
`npm i @tonconnect/isomorphic-eventsource`

## How to use
Just import the package and use global `EventSource` constructor:

```ts
import '@tonconnect/isomorphic-eventsource';

const eventSourceInstance = new EventSource();
```

That will work in both browser and NodeJS.

## How does it work
This package exports an empty script if bundler creates browser-compatible build. 
When package is imported in NodeJS environment, it assigns an `EventSource` imported from the `eventsource` package to the `global` variable.

Note that this package doesn't provide an `EventSource` polyfill for browsers which doesn't support `EventSource` natively. 
