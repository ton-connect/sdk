# TonConnect UI Vue

## Introduction

TonConnect UI Vue is a library that provides components and context for integrating TonConnect UI in your Vue.js applications. This README will guide you through the setup and usage of the library.

## Installation

To install the library, use your preferred package manager:

```bash
npm install @tonconnect/ui-vue
# or
yarn add @tonconnect/ui-vue
```

## Setup

### 1. Import and Create the TonConnectUIProvider

In your `main.ts`, import the necessary functions and contexts from `@tonconnect/ui-vue`, and create the `TonConnectUIProvider` with your manifest URL.

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import {
    createTonConnectUIProvider,
    TonConnectUIContext,
    TonConnectUIOptionsContext
} from '@tonconnect/ui-vue';

const { tonConnectUI, setOptions } = createTonConnectUIProvider({
    manifestUrl: 'https://gist.githubusercontent.com/siandreev/75f1a2ccf2f3b4e2771f6089aeb06d7f/raw/d4986344010ec7a2d1cc8a2a9baa57de37aaccb8/gistfile1.txt'
});

const app = createApp(App);

app.provide(TonConnectUIContext, tonConnectUI);
app.provide(TonConnectUIOptionsContext, setOptions);

app.mount('#app');
```

### 2. Using the Connect Button

To use the connect button in your components, follow these steps:

1. **Import the `TonConnectButton` component in your script setup.**
2. **Use the `TonConnectButton` component in your template.**

#### Example Component

Create a component or use the `TonConnectButton` in an existing component as shown below:

```vue
<script setup lang="ts">
import { TonConnectButton } from './components';
</script>

<template>
    <div>
        <TonConnectButton />
    </div>
</template>
```

### 3. Full Example

Below is a complete example combining the setup and usage of the connect button:

#### `main.ts`

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import {
    createTonConnectUIProvider,
    TonConnectUIContext,
    TonConnectUIOptionsContext
} from '@tonconnect/ui-vue';

const { tonConnectUI, setOptions } = createTonConnectUIProvider({
    manifestUrl: 'https://gist.githubusercontent.com/siandreev/75f1a2ccf2f3b4e2771f6089aeb06d7f/raw/d4986344010ec7a2d1cc8a2a9baa57de37aaccb8/gistfile1.txt'
});

const app = createApp(App);

app.provide(TonConnectUIContext, tonConnectUI);
app.provide(TonConnectUIOptionsContext, setOptions);

app.mount('#app');
```

#### `App.vue`

```vue
<template>
    <div id="app">
        <TonConnectButton />
    </div>
</template>

<script setup lang="ts">
import { TonConnectButton } from './components';
</script>
```
