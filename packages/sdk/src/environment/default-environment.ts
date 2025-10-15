import { IEnvironment } from 'src/environment/models/environment.interface';

export class DefaultEnvironment implements IEnvironment {
    constructor() {}

    getClientEnvironment() {
        return 'web';
    }

    getBrowser() {
        return 'unknown';
    }

    getLocale() {
        return 'unknown';
    }

    getPlatform() {
        return 'unknown';
    }

    getTelegramUser() {
        return undefined;
    }
}
