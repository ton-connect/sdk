export const getTonconnectVersion = () => {
    window.addEventListener(
        'ton-connect-response-version',
        (e: Event) => {
            const event = e as CustomEvent<{ version: string }>;
            // eslint-disable-next-line no-console
            console.log(`@tonconnect/sdk@${event.detail.version}`);
        },
        { once: true }
    );
    window.addEventListener(
        'ton-connect-ui-response-version',
        (e: Event) => {
            const event = e as CustomEvent<{ version: string }>;
            // eslint-disable-next-line no-console
            console.log(`@tonconnect/ui@${event.detail.version}`);
        },
        { once: true }
    );

    window.dispatchEvent(
        new CustomEvent('ton-connect-request-version', { detail: { type: 'request-version' } })
    );
    window.dispatchEvent(
        new CustomEvent('ton-connect-ui-request-version', { detail: { type: 'request-version' } })
    );
};
