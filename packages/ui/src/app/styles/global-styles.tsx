import { JSXElement } from 'solid-js';
import { createGlobalStyles } from 'solid-styled-components';

export const GlobalStyles = (): JSXElement => {
    const Styles = createGlobalStyles`
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    html, body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
  `;
    return <Styles />;
};
