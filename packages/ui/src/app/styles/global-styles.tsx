import { JSXElement } from 'solid-js';
import { createGlobalStyles } from 'solid-styled-components';

export const GlobalStyles = (): JSXElement => {
    document.body.addEventListener('mousedown', () => document.body.classList.add('using-mouse'));

    document.body.addEventListener('keydown', event => {
        if (event.key === 'Tab') {
            document.body.classList.remove('using-mouse');
        }
    });

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
    
    *:focus {
        outline: #08f auto 2px;
    }

    body.using-mouse :focus {
        outline: none;
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
