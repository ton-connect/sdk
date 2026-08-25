/**
 * Registry `app_name`s the wallets modal treats specially. Everything else about these wallets —
 * display name, icon, bridge, universal link, features — comes from the wallets list like any
 * other wallet; only their placement in the modal is hardcoded.
 */

/**
 * Built-in Telegram wallet, promoted to the primary button.
 *
 * TODO: not in the live registry yet — see the matching entry in `fallback-wallets-list.ts`.
 */
export const TELEGRAM_WALLET_APP_NAME = 'telegram';

/** Gram Wallet, promoted to the secondary button. */
export const GRAM_WALLET_APP_NAME = 'gramwallet';

/** Walt, the Telegram-hosted wallet formerly branded "@wallet". */
export const WALT_APP_NAME = 'telegram-wallet';
