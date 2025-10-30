import { IEnvironment } from 'src/environment/models/environment.interface';

export class DefaultEnvironment implements IEnvironment {
    getClientEnvironment() {
        return '';
    }

    getBrowser() {
        return '';
    }

    getLocale() {
        return '';
    }

    getPlatform() {
        return '';
    }

    getTelegramUser() {
        return undefined;
    }
}
