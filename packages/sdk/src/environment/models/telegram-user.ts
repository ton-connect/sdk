/**
 * Basic Telegram user information.
 */
export type TelegramUser = {
    /** Unique Telegram user ID. */
    id: number;

    /** Whether the user has Telegram Premium. */
    isPremium: boolean;
};
