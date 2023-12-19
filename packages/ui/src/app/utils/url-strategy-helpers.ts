import { ReturnStrategy } from 'src/models/return-strategy';
import { isInTMA, isTmaPlatform, sendOpenTelegramLink } from 'src/app/utils/tma-api';
import { isOS, openDeeplinkWithFallback, openLinkBlank } from 'src/app/utils/web-api';
import { encodeTelegramUrlParameters, isTelegramUrl } from '@tonconnect/sdk';

/**
 * Adds a return strategy to a url.
 * @param url
 * @param strategy
 * TODO: refactor this method
 */
export function addReturnStrategy(
    url: string,
    strategy:
        | ReturnStrategy
        | {
              returnStrategy: ReturnStrategy;
              twaReturnUrl: `${string}://${string}` | undefined;
          }
): string {
    let returnStrategy;
    if (typeof strategy === 'string') {
        returnStrategy = strategy;
    } else {
        returnStrategy = isInTMA() ? strategy.twaReturnUrl || strategy.returnStrategy : 'none';
    }
    const newUrl = addQueryParameter(url, 'ret', returnStrategy);

    if (!isTelegramUrl(url)) {
        return newUrl;
    }

    const lastParam = newUrl.slice(newUrl.lastIndexOf('&') + 1);
    return newUrl.slice(0, newUrl.lastIndexOf('&')) + '-' + encodeTelegramUrlParameters(lastParam);
}

/**
 * Redirects the user to a specified Telegram link with various strategies for returning to the application.
 * This function is primarily used for TON Space to handle different platforms and operating systems.
 *
 * @param universalLink A string representing the universal link to redirect to within Telegram.
 * @param options An object containing specific properties to customize the redirect behavior:
 *   - returnStrategy: An enum `ReturnStrategy` dictating the method for returning to the app after the action is completed.
 *   - twaReturnUrl: A URL template string for TMA return, or `undefined` if not applicable.
 *   - forceRedirect: A boolean flag to force redirection, bypassing deep link fallback mechanisms.
 *
 * The function adapts its behavior based on the execution context, such as the TMA or browser environment, and the operating system.
 * Different strategies involve manipulating URL parameters and utilizing platform-specific features for optimal user experience.
 */
export function redirectToTelegram(
    universalLink: string,
    options: {
        returnStrategy: ReturnStrategy;
        twaReturnUrl: `${string}://${string}` | undefined;
        forceRedirect: boolean;
    }
): void {
    options = { ...options };
    // TODO: Remove this line after all dApps and the wallets-list.json have been updated
    const directLink = convertToTGDirectLink(universalLink);
    const directLinkUrl = new URL(directLink);

    if (!directLinkUrl.searchParams.has('startapp')) {
        directLinkUrl.searchParams.append('startapp', 'tonconnect');
    }

    if (isInTMA()) {
        if (isTmaPlatform('ios', 'android')) {
            // Use the `none` strategy, the current TMA instance will keep open.
            // TON Space should automatically open in stack and should close
            // itself after the user action.

            options.returnStrategy = 'back';
            options.twaReturnUrl = undefined;

            sendOpenTelegramLink(addReturnStrategy(directLinkUrl.toString(), options));
        } else if (isTmaPlatform('macos', 'tdesktop')) {
            // Use a strategy involving a direct link to return to the app.
            // The current TMA instance will close, and TON Space should
            // automatically open, and reopen the application once the user
            // action is completed.

            sendOpenTelegramLink(addReturnStrategy(directLinkUrl.toString(), options));
        } else if (isTmaPlatform('weba')) {
            // Similar to macos/tdesktop strategy, but opening another TMA occurs
            // through sending `web_app_open_tg_link` event to `parent`.

            sendOpenTelegramLink(addReturnStrategy(directLinkUrl.toString(), options));
        } else if (isTmaPlatform('web')) {
            // Similar to iOS/Android strategy, but opening another TMA occurs
            // through sending `web_app_open_tg_link` event to `parent`.

            options.returnStrategy = 'back';
            options.twaReturnUrl = undefined;

            sendOpenTelegramLink(addReturnStrategy(directLinkUrl.toString(), options));
        } else {
            // Fallback for unknown platforms. Should use desktop strategy.

            openLinkBlank(addReturnStrategy(directLinkUrl.toString(), options));
        }
    } else {
        // For browser
        if (isOS('ios', 'android')) {
            // Use the `none` strategy. TON Space should do nothing after the user action.

            options.returnStrategy = 'none';

            openLinkBlank(addReturnStrategy(directLinkUrl.toString(), options.returnStrategy));
        } else if (isOS('macos', 'windows', 'linux')) {
            // Use the `none` strategy. TON Space should do nothing after the user action.

            options.returnStrategy = 'none';
            options.twaReturnUrl = undefined;

            if (options.forceRedirect) {
                openLinkBlank(addReturnStrategy(directLinkUrl.toString(), options));
            } else {
                const link = addReturnStrategy(directLinkUrl.toString(), options);
                const deepLink = convertToTGDeepLink(link);

                openDeeplinkWithFallback(deepLink, () => openLinkBlank(link));
            }
        } else {
            // Fallback for unknown platforms. Should use desktop strategy.

            openLinkBlank(addReturnStrategy(directLinkUrl.toString(), options));
        }
    }
}

/**
 * Adds a query parameter to a URL.
 * @param url
 * @param key
 * @param value
 */
function addQueryParameter(url: string, key: string, value: string): string {
    const parsed = new URL(url);
    parsed.searchParams.append(key, value);
    return parsed.toString();
}

/**
 * Converts a universal link to a direct link.
 * @param universalLink
 * TODO: Remove this method after all dApps and the wallets-list.json have been updated
 */
function convertToTGDirectLink(universalLink: string): string {
    const url = new URL(universalLink);

    if (url.searchParams.has('attach')) {
        url.searchParams.delete('attach');
        url.pathname += '/start';
    }

    return url.toString();
}

/**
 * Converts a direct link to a deep link.
 * @param directLink
 */
function convertToTGDeepLink(directLink: string): string {
    const parsed = new URL(directLink);
    const [, domain, appname] = parsed.pathname.split('/');
    const startapp = parsed.searchParams.get('startapp');
    return `tg://resolve?domain=${domain}&appname=${appname}&startapp=${startapp}`;
}
