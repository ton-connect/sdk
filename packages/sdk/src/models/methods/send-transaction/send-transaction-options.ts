import { ReturnStrategy } from '@tonconnect/protocol';

export interface SendTransactionOptions {
    /**
     * @default 'back'
     * Return strategy for deeplinks when the user accepts or declines the request.
     *   - `'back'` means return to the app which initialized deeplink jump (e.g. browser, native app, ...),
     *   - `'none'` means no jumps after user action;
     *   - a URL: wallet will open this URL after completing the user's action. Note, that you shouldn't pass your app's URL if it is a webpage. This option should be used for native apps to work around possible OS-specific issues with `'back'` option.
     */
    return: ReturnStrategy;
}
