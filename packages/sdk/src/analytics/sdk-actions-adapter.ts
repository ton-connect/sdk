import { EventDispatcher } from 'src/tracker/event-dispatcher';
import { ConnectionInfo, SdkActionEvent, Version } from 'src/tracker/types';
import { Analytics } from 'src/analytics/analytics';

function buildVersionInfo(version: Version): Record<string, string> {
    return {
        '@tonconnect/sdk': version.ton_connect_sdk_lib || '',
        '@tonconnect/ui': version.ton_connect_ui_lib || ''
    };
}

function buildTonConnectEvent(detail: ConnectionInfo) {
    return {
        versions: buildVersionInfo(detail.custom_data),
        network_id: detail.custom_data.chain_id ?? '',
        client_id: detail.custom_data.client_id ?? '',
        wallet_id: detail.custom_data.wallet_id ?? '',
        wallet_address: detail.wallet_address ?? '',
        wallet_app_name: detail.wallet_type ?? '',
        wallet_app_version: detail.wallet_version ?? '',
        wallet_state_init: detail.wallet_state_init ?? ''
    };
}

export function bindEventsTo(
    eventDispatcher: EventDispatcher<SdkActionEvent>,
    analytics: Analytics
) {
    eventDispatcher.addEventListener('ton-connect-ui-wallet-modal-opened', event => {
        const { detail } = event;
        analytics.emitConnectionStarted({
            client_id: detail.client_id || '',
            versions: buildVersionInfo(detail.custom_data),
            main_screen: detail.visible_wallets
        });
    });

    eventDispatcher.addEventListener('ton-connect-connection-completed', event => {
        const { detail } = event;
        analytics.emitConnectionCompleted(buildTonConnectEvent(detail));
    });
    eventDispatcher.addEventListener('ton-connect-connection-error', event => {
        const { detail } = event;
        analytics.emitConnectionError({
            client_id: detail.custom_data.client_id || '', // TODO what if empty?,
            wallet_id: detail.custom_data.wallet_id || '', // TODO what if empty?,
            error_code: detail.error_code?.toString() ?? '',
            error_message: detail.error_message
        });
    });
    eventDispatcher.addEventListener('ton-connect-disconnection', event => {
        const { detail } = event;
        analytics.emitDisconnection(buildTonConnectEvent(detail));
    });
    eventDispatcher.addEventListener('ton-connect-transaction-sent-for-signature', event => {
        const { detail } = event;
        analytics.emitTransactionSent(buildTonConnectEvent(detail));
    });
    eventDispatcher.addEventListener('ton-connect-transaction-signed', event => {
        const { detail } = event;
        analytics.emitTransactionSigned({
            ...buildTonConnectEvent(detail),
            signed_boc: event.detail.signed_transaction
        });
    });
    eventDispatcher.addEventListener('ton-connect-transaction-signing-failed', event => {
        const { detail } = event;
        analytics.emitTransactionSigningFailed({
            ...buildTonConnectEvent(detail),
            valid_until: Number(detail.valid_until),
            messages: detail.messages.map(message => ({
                address: message.address ?? '',
                amount: message.amount ?? '',
                payload: message.payload ?? ''
            })),
            error_message: detail.error_message,
            error_code: detail.error_code?.toString() ?? ''
        });
    });
    eventDispatcher.addEventListener('ton-connect-sign-data-request-initiated', event => {
        const { detail } = event;
        analytics?.emitSignDataRequestInitiated(buildTonConnectEvent(detail));
    });
    eventDispatcher.addEventListener('ton-connect-sign-data-request-completed', event => {
        const { detail } = event;
        analytics?.emitSignDataRequestCompleted(buildTonConnectEvent(detail));
    });
    eventDispatcher.addEventListener('ton-connect-sign-data-request-failed', event => {
        const { detail } = event;
        let signDataValue = '';
        let signDataSchema: string | undefined = undefined;
        if (detail.data.type === 'text') {
            signDataValue = detail.data.text;
        }
        if (detail.data.type === 'cell') {
            signDataValue = detail.data.cell;
            signDataSchema = detail.data.schema;
        }
        if (detail.data.type === 'binary') {
            signDataValue = detail.data.bytes;
        }
        analytics?.emitSignDataRequestFailed({
            ...buildTonConnectEvent(detail),
            sign_data_type: detail.data.type,
            sign_data_value: signDataValue,
            sign_data_schema: signDataSchema,
            error_code: detail.error_code?.toString() ?? '',
            error_message: detail.error_message
        });
    });
}
