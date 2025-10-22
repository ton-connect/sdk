import { TelegramUser } from 'src/environment/models/telegram-user';

/**
 * Represents the client environment in which the application is running.
 */
export interface IEnvironment {
    /**
     * Retrieves the user's current locale setting.
     */
    getLocale(): string;

    /**
     * Retrieves the name or identifier of the user's browser.
     */
    getBrowser(): string;

    /**
     * Retrieves the name of the user's operating system or platform.
     */
    getPlatform(): string;

    /**
     * Retrieves the Telegram user associated with the current environment, if available.
     */
    getTelegramUser(): TelegramUser | undefined;

    /**
     * Retrieves the type of client environment.
     * Indicates whether the client is running as a web application,
     * Telegram Mini App, or another custom environment.
     */
    getClientEnvironment(): 'web' | 'miniapp' | (string & {});
}
