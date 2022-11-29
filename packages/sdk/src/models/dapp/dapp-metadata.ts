export interface DappMetadata {
    /**
     * Dapp name. Might be simple, will not be used as identifier.
     * @default `document.title` if exists, 'Unknown dapp' overwise
     */
    name: string;

    /**
     * URL to the dapp icon. Must be PNG, ICO, ... . SVG icons are not supported.
     * @default best quality favicon declared via <link> in the document or '' if there are no any icons in the document.
     */
    icon: string;

    /**
     * Dapp URL. Will be used as the dapp identifier. Will be used to open the dapp after click to its icon in the wallet.
     * It is recommended to pass url without closing slash, e.g. 'https://mydapp.com' instead of 'https://mydapp.com/'.
     * @default `window.location.origin` if exists, otherwise (if not explicitly specified) an error will be thrown.
     */
    url: string;
}
