import { Base64 } from '@tonconnect/protocol';

export function isMoreThanDayToExpire(token: string) {
    try {
        const payload = JSON.parse(Base64.decode(token.split('.')[1]).toString());
        return payload.exp - Date.now() / 1000 > 24 * 60 * 60;
    } catch (error) {
        console.error(error);
        return false;
    }
}
