export interface DappMetadata {
    /**
     * dApp name. Might be simple; not used as identifier.
     * Defaults to `document.title`, or to `'Unknown dApp'` when no document title is present.
     */
    name: string;

    /**
     * URL to the dApp icon. Must be PNG, ICO, ... . SVG icons are not supported.
     * Defaults to the best-quality favicon declared via a `<link>` element in the document,
     * or to an empty string when no favicon is declared.
     */
    icon: string;

    /**
     * dApp URL. Identifies the dApp; the wallet opens this URL when the user taps the dApp icon.
     * It is recommended to pass url without closing slash, e.g. 'https://mydapp.com' instead of 'https://mydapp.com/'.
     * Defaults to `window.location.origin`; the TonConnect constructor throws
     * `DappMetadataError` when neither `url` nor `window.location.origin` is available
     * (e.g., in a Node.js environment without an explicit manifest URL).
     */
    url: string;
}
