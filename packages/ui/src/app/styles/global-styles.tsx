import { JSXElement } from 'solid-js';
import { createGlobalStyles } from 'solid-styled-components';

export const GlobalStyles = (): JSXElement => {
    const Styles = createGlobalStyles`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: SF Pro, Roboto, sans-serif;
    }
    html, body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    li {
        list-style: none;
    }
    button {
        outline: none;
    }
  `;
    return <Styles />;
};
