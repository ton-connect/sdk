export function isMoreThanDayToExpire(token: string) {
    try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
        return payload.exp - Date.now() / 1000 > 24 * 60 * 60;
    } catch (error) {
        console.error(error);
        return false;
    }
}
