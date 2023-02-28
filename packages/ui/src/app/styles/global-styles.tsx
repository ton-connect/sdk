import { JSXElement } from 'solid-js';
import { createGlobalStyles } from 'solid-styled-components';

export const globalStylesTag = 'tc-root';
export const disableScrollClass = 'tc-disable-scroll';
export const usingMouseClass = 'tc-using-mouse';

export const GlobalStyles = (): JSXElement => {
    document.body.addEventListener('mousedown', () => document.body.classList.add(usingMouseClass));

    document.body.addEventListener('keydown', event => {
        if (event.key === 'Tab') {
            document.body.classList.remove(usingMouseClass);
        }
    });

    const Styles = createGlobalStyles`
    ${globalStylesTag} * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        
        font-family: -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, Tahoma, Verdana, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;        
        -webkit-tap-highlight-color: transparent;
    }
    
    ${globalStylesTag} img {
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }   
 
    ${globalStylesTag} *:focus {
        outline: #08f auto 2px;
    }
    
    ${globalStylesTag} li {
        list-style: none;
    }
    
    ${globalStylesTag} button {
        outline: none;
    }
    
    body.${disableScrollClass} {
        position: fixed; 
        overflow-y: scroll;
        right: 0;
        left: 0;
    }
    
    body.${usingMouseClass} ${globalStylesTag} *:focus {
        outline: none;
    }
`;
    return <Styles />;
};
