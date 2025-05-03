import { ReturnStrategy } from 'src/models/return-strategy';
import {
    isInTelegramBrowser,
    isInTMA,
    isTmaPlatform,
    sendOpenTelegramLink
} from 'src/app/utils/tma-api';
import {
    isBrowser,
    isOS,
    openDeeplinkWithFallback,
    openLink,
    openLinkBlank,
    toDeeplink
} from 'src/app/utils/web-api';
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

    if (isInTelegramBrowser()) {
        // return back to the telegram browser
        options.returnStrategy = 'back';
        const linkWitStrategy = addReturnStrategy(directLinkUrl.toString(), options.returnStrategy);

        openLinkBlank(linkWitStrategy);
    } else if (isInTMA()) {
        if (isTmaPlatform('ios', 'android', 'macos', 'tdesktop', 'web')) {
            // Use the `back` strategy, the current TMA instance will keep open.
            // TON Space should automatically open in stack and should close
            // itself after the user action.

            options.returnStrategy = 'back';
            const linkWitStrategy = addReturnStrategy(
                directLinkUrl.toString(),
                options.returnStrategy
            );

            sendOpenTelegramLink(linkWitStrategy);
        } else if (isTmaPlatform('weba')) {
            // TODO: move weba to the ios/android/macOS/tdesktop strategy
            // Similar to tdesktop strategy, but opening another TMA occurs
            // through sending `web_app_open_tg_link` event to `parent`.

            sendOpenTelegramLink(addReturnStrategy(directLinkUrl.toString(), options));
        } else {
            // Fallback for unknown platforms. Should use desktop strategy.

            openLinkBlank(addReturnStrategy(directLinkUrl.toString(), options));
        }
    } else {
        // For browser
        if (isOS('ios')) {
            // Use the `back` strategy, the user will transition to the other app
            // and return to the browser when the action is completed.

            // TODO: use back for all browsers
            // return back to the browser
            if (options.returnStrategy === 'back') {
                if (isBrowser('safari')) {
                    // safari does not have a deep link, so we use the `location.href`
                    // ref: https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app
                    options.returnStrategy = 'back';
                } else if (isBrowser('chrome')) {
                    options.returnStrategy = 'googlechrome://';
                } else if (isBrowser('firefox')) {
                    options.returnStrategy = 'firefox://';
                } else if (isBrowser('opera')) {
                    options.returnStrategy = 'opera-http://';
                } else {
                    // fallback to the `location.href`
                    options.returnStrategy = location.href as ReturnStrategy;
                }
            }

            // In case if the browser is Chrome or Firefox, use the deep link with fallback to the direct link.
            const isChrome = isBrowser('chrome');
            const isFirefox = isBrowser('firefox');
            const useDeepLink = (isChrome || isFirefox) && !options.forceRedirect;

            if (useDeepLink) {
                const linkWithStrategy = addReturnStrategy(
                    directLinkUrl.toString(),
                    options.returnStrategy
                );
                const deepLink = convertToTGDeepLink(linkWithStrategy);

                openDeeplinkWithFallback(deepLink, () => openLinkBlank(linkWithStrategy));
            } else {
                const linkWithStrategy = addReturnStrategy(
                    directLinkUrl.toString(),
                    options.returnStrategy
                );

                openLinkBlank(linkWithStrategy);
            }
        } else if (isOS('android')) {
            // Use the `none` strategy, the user will transition to the other app
            // and return to the browser when the action is completed.

            // TODO: use back for all browsers
            options.returnStrategy = 'back';

            // In case if the browser is Chrome or Firefox, use the deep link with fallback to the direct link.
            const isChrome = isBrowser('chrome');
            const isFirefox = isBrowser('firefox');
            const useDeepLink = (isChrome || isFirefox) && !options.forceRedirect;

            if (useDeepLink) {
                const linkWithStrategy = addReturnStrategy(
                    directLinkUrl.toString(),
                    options.returnStrategy
                );
                const deepLink = convertToTGDeepLink(linkWithStrategy);

                openDeeplinkWithFallback(deepLink, () => openLinkBlank(linkWithStrategy));
            } else {
                const linkWithStrategy = addReturnStrategy(
                    directLinkUrl.toString(),
                    options.returnStrategy
                );

                openLinkBlank(linkWithStrategy);
            }
        } else if (isOS('ipad')) {
            // Use the `back` strategy, the user will transition to the other app
            // and return to the browser when the action is completed.

            // return back to the browser
            if (options.returnStrategy === 'back') {
                if (isBrowser('safari')) {
                    // safari does not have a deep link, so we use the `location.href`
                    // ref: https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app
                    options.returnStrategy = 'back';
                } else if (isBrowser('chrome')) {
                    options.returnStrategy = 'googlechrome://';
                } else if (isBrowser('firefox')) {
                    options.returnStrategy = 'firefox://';
                } else if (isBrowser('opera')) {
                    options.returnStrategy = 'opera-http://';
                } else {
                    // fallback to the `location.href`
                    options.returnStrategy = location.href as ReturnStrategy;
                }
            }

            // In case if the browser is Chrome or Firefox, use the deep link with fallback to the direct link.
            const isChrome = isBrowser('chrome');
            const isFirefox = isBrowser('firefox');
            const useDeepLink = (isChrome || isFirefox) && !options.forceRedirect;

            const linkWithStrategy = addReturnStrategy(
                directLinkUrl.toString(),
                options.returnStrategy
            );

            if (useDeepLink) {
                const deepLink = convertToTGDeepLink(linkWithStrategy);

                openDeeplinkWithFallback(deepLink, () => openLinkBlank(linkWithStrategy));
            } else {
                openLinkBlank(linkWithStrategy);
            }
        } else if (isOS('macos', 'windows', 'linux')) {
            // Use the `none` strategy. The user will transition to the TON Space
            // and return to the TMA after the action is completed.

            options.returnStrategy = 'back';
            options.twaReturnUrl = undefined;

            const linkWithStrategy = addReturnStrategy(
                directLinkUrl.toString(),
                options.returnStrategy
            );

            if (options.forceRedirect) {
                openLinkBlank(linkWithStrategy);
            } else {
                const deepLink = convertToTGDeepLink(linkWithStrategy);

                openDeeplinkWithFallback(deepLink, () => openLinkBlank(linkWithStrategy));
            }
        } else {
            // Fallback for unknown platforms. Should use desktop strategy.

            openLinkBlank(addReturnStrategy(directLinkUrl.toString(), options));
        }
    }
}

/**
 * Redirects the user to a specified wallet link with various strategies for returning to the application.
 * This function is primarily used for any wallet (except TON Space) to handle different platforms and operating systems.
 *
 * @param universalLink A string representing the universal link to redirect to within the wallet.
 * @param deepLink A string representing the deep link to redirect to within the wallet, or `undefined` if not applicable.
 * @param options An object containing specific properties to customize the redirect behavior:
 *  - returnStrategy: An enum `ReturnStrategy` dictating the method for returning to the app after the action is completed.
 *  - forceRedirect: A boolean flag to force redirection, bypassing deep link fallback mechanisms.
 * @param setOpenMethod A function to set the method of opening the wallet.
 *
 * The function adapts its behavior based on the execution context, such as the TMA or browser environment, and the operating system.
 * Different strategies involve manipulating URL parameters and utilizing platform-specific features for optimal user experience.
 */
export function redirectToWallet(
    universalLink: string,
    deepLink: string | undefined,
    options: {
        returnStrategy: ReturnStrategy;
        forceRedirect: boolean;
    },
    setOpenMethod: (method: 'universal-link' | 'custom-deeplink') => void
): void {
    options = { ...options };

    if (isInTelegramBrowser()) {
        if (isOS('ios', 'android')) {
            // return back to the telegram browser
            if (options.returnStrategy === 'back') {
                options.returnStrategy = 'tg://resolve';
            }

            setOpenMethod('universal-link');

            openLink(addReturnStrategy(universalLink, options.returnStrategy), '_self');
        } else {
            // Fallback for unknown platforms. Should use desktop strategy.
            setOpenMethod('universal-link');

            const linkWitStrategy = addReturnStrategy(universalLink, options.returnStrategy);

            openLinkBlank(linkWitStrategy);
        }
    } else if (isInTMA()) {
        if (isTmaPlatform('ios', 'android')) {
            // Use the `tg://resolve` strategy instead of `back`, the user will transition to the other app
            // and return to the Telegram app after the action is completed.

            // return back to the telegram app
            if (options.returnStrategy === 'back') {
                options.returnStrategy = 'tg://resolve';
            }

            setOpenMethod('universal-link');

            const linkWitStrategy = addReturnStrategy(universalLink, options.returnStrategy);

            sendOpenTelegramLink(linkWitStrategy, () => {
                setOpenMethod('universal-link');

                openLinkBlank(linkWitStrategy);
            });
        } else if (isTmaPlatform('macos', 'tdesktop')) {
            // Use the `tg://resolve` strategy instead of `back`, the user will transition to the other app
            // and return to the Telegram app after the action is completed.

            // return back to the telegram app
            if (options.returnStrategy === 'back') {
                options.returnStrategy = 'tg://resolve';
            }

            const linkWitStrategy = addReturnStrategy(universalLink, options.returnStrategy);
            const useDeepLink = !!deepLink && !options.forceRedirect;

            // In case of deep link, use the `custom-deeplink` strategy with fallback to `universal-link`.
            if (useDeepLink) {
                setOpenMethod('custom-deeplink');

                openDeeplinkWithFallback(toDeeplink(linkWitStrategy, deepLink), () => {
                    setOpenMethod('universal-link');

                    openLinkBlank(linkWitStrategy);
                });
            } else {
                setOpenMethod('universal-link');

                openLinkBlank(linkWitStrategy);
            }
        } else if (isTmaPlatform('weba')) {
            // Use the `back` strategy, the user will transition to the other app
            // and maybe return to the browser when the action is completed.

            // return back to the browser
            if (options.returnStrategy === 'back') {
                if (isBrowser('safari')) {
                    // safari does not have a deep link, so we use the `location.href`
                    options.returnStrategy = location.href as ReturnStrategy;
                } else if (isBrowser('chrome')) {
                    options.returnStrategy = 'googlechrome://';
                } else if (isBrowser('firefox')) {
                    options.returnStrategy = 'firefox://';
                } else if (isBrowser('opera')) {
                    options.returnStrategy = 'opera-http://';
                } else {
                    // fallback to the `location.href`
                    options.returnStrategy = location.href as ReturnStrategy;
                }
            }

            const linkWitStrategy = addReturnStrategy(universalLink, options.returnStrategy);
            const useDeepLink = !!deepLink && !options.forceRedirect;

            // In case of deep link, use the `custom-deeplink` strategy with fallback to `universal-link`.
            if (useDeepLink) {
                setOpenMethod('custom-deeplink');

                openDeeplinkWithFallback(toDeeplink(linkWitStrategy, deepLink), () => {
                    setOpenMethod('universal-link');

                    openLinkBlank(linkWitStrategy);
                });
            } else {
                setOpenMethod('universal-link');

                openLinkBlank(linkWitStrategy);
            }
        } else if (isTmaPlatform('web')) {
            // Use the `back` strategy, the user will transition to the other app
            // and maybe return to the browser when the action is completed.

            // return back to the browser
            if (options.returnStrategy === 'back') {
                if (isBrowser('safari')) {
                    // safari does not have a deep link, so we use the `location.href`
                    options.returnStrategy = location.href as ReturnStrategy;
                } else if (isBrowser('chrome')) {
                    options.returnStrategy = 'googlechrome://';
                } else if (isBrowser('firefox')) {
                    options.returnStrategy = 'firefox://';
                } else if (isBrowser('opera')) {
                    options.returnStrategy = 'opera-http://';
                } else {
                    // fallback to the `location.href`
                    options.returnStrategy = location.href as ReturnStrategy;
                }
            }

            const linkWitStrategy = addReturnStrategy(universalLink, options.returnStrategy);
            const useDeepLink = !!deepLink && !options.forceRedirect;

            // In case of deep link, use the `custom-deeplink` strategy with fallback to `universal-link`.
            if (useDeepLink) {
                setOpenMethod('custom-deeplink');

                openDeeplinkWithFallback(toDeeplink(linkWitStrategy, deepLink), () => {
                    setOpenMethod('universal-link');

                    openLinkBlank(linkWitStrategy);
                });
            } else {
                setOpenMethod('universal-link');

                openLinkBlank(linkWitStrategy);
            }
        } else {
            // Fallback for unknown platforms. Should use desktop strategy.
            setOpenMethod('universal-link');

            const linkWitStrategy = addReturnStrategy(universalLink, options.returnStrategy);

            openLinkBlank(linkWitStrategy);
        }
    } else {
        if (isOS('ios')) {
            // Use the `back` strategy, the user will transition to the other app
            // and return to the browser when the action is completed.

            // return back to the browser
            if (options.returnStrategy === 'back') {
                if (isBrowser('safari')) {
                    // safari does not have a deep link, so we use the `location.href`
                    // ref: https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app
                    options.returnStrategy = 'none';
                } else if (isBrowser('chrome')) {
                    options.returnStrategy = 'googlechrome://';
                } else if (isBrowser('firefox')) {
                    options.returnStrategy = 'firefox://';
                } else if (isBrowser('opera')) {
                    options.returnStrategy = 'opera-http://';
                } else {
                    // fallback to the `location.href`
                    options.returnStrategy = location.href as ReturnStrategy;
                }
            }

            if (isBrowser('chrome')) {
                setOpenMethod('universal-link');

                // TODO: in case when the wallet does not exist, the location.href will be rewritten
                openLink(addReturnStrategy(universalLink, options.returnStrategy), '_self');
            } else {
                setOpenMethod('universal-link');

                openLinkBlank(addReturnStrategy(universalLink, options.returnStrategy));
            }
        } else if (isOS('android')) {
            // Use the `back` strategy, the user will transition to the other app
            // and return to the browser when the action is completed.

            // return back to the browser
            if (options.returnStrategy === 'back') {
                if (isBrowser('chrome')) {
                    options.returnStrategy = 'googlechrome://';
                } else if (isBrowser('firefox')) {
                    options.returnStrategy = 'firefox://';
                } else if (isBrowser('opera')) {
                    options.returnStrategy = 'opera-http://';
                } else {
                    options.returnStrategy = location.href as ReturnStrategy;
                }
            }

            setOpenMethod('universal-link');

            openLinkBlank(addReturnStrategy(universalLink, options.returnStrategy));
        } else if (isOS('ipad')) {
            // Use the `back` strategy, the user will transition to the other app
            // and return to the browser when the action is completed.

            // return back to the browser
            if (options.returnStrategy === 'back') {
                if (isBrowser('safari')) {
                    // safari does not have a deep link, so we use the `location.href`
                    // ref: https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app
                    options.returnStrategy = 'none';
                } else if (isBrowser('chrome')) {
                    options.returnStrategy = 'googlechrome://';
                } else if (isBrowser('firefox')) {
                    options.returnStrategy = 'firefox://';
                } else if (isBrowser('opera')) {
                    options.returnStrategy = 'opera-http://';
                } else {
                    // fallback to the `location.href`
                    options.returnStrategy = location.href as ReturnStrategy;
                }
            }

            if (isBrowser('chrome')) {
                setOpenMethod('universal-link');

                // TODO: in case when the wallet does not exist, the location.href will be rewritten
                openLink(addReturnStrategy(universalLink, options.returnStrategy), '_self');
            } else {
                setOpenMethod('universal-link');

                openLinkBlank(addReturnStrategy(universalLink, options.returnStrategy));
            }
        } else if (isOS('macos', 'windows', 'linux')) {
            // Use the `back` strategy, the user will transition to the other app
            // and return to the browser when the action is completed.

            // return back to the browser
            if (options.returnStrategy === 'back') {
                if (isBrowser('safari')) {
                    options.returnStrategy = 'none';
                } else if (isBrowser('chrome')) {
                    options.returnStrategy = 'googlechrome://';
                } else if (isBrowser('firefox')) {
                    options.returnStrategy = 'firefox://';
                } else if (isBrowser('opera')) {
                    options.returnStrategy = 'opera-http://';
                } else {
                    options.returnStrategy = 'none';
                }
            }

            const linkWitStrategy = addReturnStrategy(universalLink, options.returnStrategy);
            const useDeepLink = !!deepLink && !options.forceRedirect;

            // In case of deep link, use the `custom-deeplink` strategy with fallback to `universal-link`.
            if (useDeepLink) {
                setOpenMethod('custom-deeplink');

                openDeeplinkWithFallback(toDeeplink(linkWitStrategy, deepLink), () => {
                    setOpenMethod('universal-link');

                    openLinkBlank(linkWitStrategy);
                });
            } else {
                setOpenMethod('universal-link');

                openLinkBlank(linkWitStrategy);
            }
        } else {
            // Fallback for unknown platforms. Should use desktop strategy.
            setOpenMethod('universal-link');

            openLinkBlank(addReturnStrategy(universalLink, options.returnStrategy));
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
