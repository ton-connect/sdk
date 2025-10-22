import { IEnvironment } from 'src/environment/models/environment.interface';

export class DefaultEnvironment implements IEnvironment {
    getClientEnvironment() {
        return 'web';
    }

    getBrowser() {
        return '';
    }

    getLocale() {
        return 'en';
    }

    getPlatform() {
        return '';
    }

    getTelegramUser() {
        return undefined;
    }
}
