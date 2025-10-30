import { IEnvironment } from '@tonconnect/sdk';
import { getUserAgent } from 'src/app/utils/web-api';
import { getTgUser, isInTMA } from 'src/app/utils/tma-api';

export class TonConnectEnvironment implements IEnvironment {
    userAgent = getUserAgent();

    getLocale() {
        return navigator.languages?.[0] || navigator.language || 'unknown';
    }
    getBrowser() {
        return this.userAgent.browser ?? 'unknown';
    }
    getPlatform() {
        return this.userAgent.os ?? 'unknown';
    }
    getTelegramUser() {
        return getTgUser();
    }
    getClientEnvironment() {
        return isInTMA() ? 'miniapp' : 'web';
    }
}
