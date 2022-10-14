import type { Component } from 'solid-js';
import { CHAIN, TonConnect } from '@ton-connect/core';

import styles from './App.module.css';

const tc = new TonConnect();

const App: Component = () => {
  return (
    <div class={styles.App}>
      {CHAIN.MAINNET}
      {tc.connected}
      <header class={styles.header}>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solid
        </a>
      </header>
    </div>
  );
};

export default App;
