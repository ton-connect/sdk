import { EventDispatcher } from 'src/tracker/event-dispatcher';
import { ConnectionInfo, SdkActionEvent, Version } from 'src/tracker/types';
import { Analytics } from 'src/analytics/analytics';
import { TonConnectEvent } from 'src/analytics/types';

function buildVersionInfo(version: Version): Record<string, string> {
    return {
        '@tonconnect/sdk': version.ton_connect_sdk_lib || '',
        '@tonconnect/ui': version.ton_connect_ui_lib || ''
    };
}

function buildTonConnectEvent(detail: ConnectionInfo & { trace_id?: string | null }) {
    return {
        versions: buildVersionInfo(detail.custom_data),
        network_id: detail.custom_data.chain_id ?? '',
        client_id: detail.custom_data.client_id ?? '',
        wallet_id: detail.custom_data.wallet_id ?? '',
        wallet_address: detail.wallet_address ?? '',
        wallet_app_name: detail.wallet_type ?? '',
        wallet_app_version: detail.wallet_version ?? '',
        wallet_state_init: detail.wallet_state_init ?? '',
        trace_id: detail.trace_id ?? undefined
    };
}

export function bindEventsTo(
    eventDispatcher: EventDispatcher<SdkActionEvent>,
    analytics: Analytics<TonConnectEvent>
) {
    eventDispatcher.addEventListener('ton-connect-ui-wallet-modal-opened', event => {
        const { detail } = event;
        analytics.emitConnectionStarted({
            client_id: detail.client_id || '',
            versions: buildVersionInfo(detail.custom_data),
            main_screen: detail.visible_wallets,
            trace_id: detail.trace_id ?? undefined
        });
    });
    eventDispatcher.addEventListener('ton-connect-ui-selected-wallet', event => {
        const { detail } = event;
        analytics.emitConnectionSelectedWallet({
            client_id: detail.client_id || '',
            versions: buildVersionInfo(detail.custom_data),
            main_screen: detail.visible_wallets,
            wallets_menu: detail.wallets_menu,
            trace_id: detail.trace_id ?? undefined,
            wallet_app_name: detail.wallet_type ?? '',
            wallet_redirect_method: detail.wallet_redirect_method,
            wallet_redirect_link: detail.wallet_redirect_link
        });
    });

    eventDispatcher.addEventListener('ton-connect-connection-completed', event => {
        const { detail } = event;
        analytics.emitConnectionCompleted(buildTonConnectEvent(detail));
    });
    eventDispatcher.addEventListener('ton-connect-connection-error', event => {
        const { detail } = event;
        analytics.emitConnectionError({
            client_id: detail.custom_data.client_id || '',
            wallet_id: detail.custom_data.wallet_id || '',
            error_code: detail.error_code ?? 0,
            error_message: detail.error_message,
            trace_id: detail.trace_id ?? undefined
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
                payload: message.payload ?? '',
                state_init: message.state_init ?? ''
            })),
            error_message: detail.error_message,
            error_code: detail.error_code ?? 0
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
            error_code: detail.error_code ?? 0,
            error_message: detail.error_message
        });
    });
}
