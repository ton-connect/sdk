import { IEnvironment } from 'src/environment/models/environment.interface';
import { getTgUser, isInTMA } from 'src/utils/tma';

export class DefaultEnvironment implements IEnvironment {
    getClientEnvironment() {
        return isInTMA() ? 'miniapp' : 'web';
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
        return getTgUser();
    }
}
