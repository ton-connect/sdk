import {
    TonConnectError,
    type ITonConnect,
    type SendTransactionResponse,
    type SignDataResponse,
    type SignMessageResponse
} from '@tonconnect/sdk';
import type { TonConnectUI } from '@tonconnect/ui-react';

import type { ActionTrigger } from '../../dev-settings/utils/settings-url';
import { defaultPayloadFor } from '../../signing/components/sign-data/utils/payloads';
import { buildDefaultSignMessage } from '../../transactions/components/sign-message/utils/sign-message-presets';
import { buildDefaultTx } from '../../transactions/components/send-transaction/utils/transaction-presets';
import { resetPreviewActionUi } from './preview-mocks';
import { resetNotificationPreviewDedupe } from './preview-notification-state';
import type { PreviewMethod, PreviewSurface, PreviewTrigger } from './preview-types';

const MOCK_SEND_TRANSACTION_RESULT: SendTransactionResponse = {
    boc: 'te6ccgEBAQEAAgAAAA=='
};

const MOCK_SIGN_DATA_RESULT: SignDataResponse = {
    signature: 'mock-signature',
    timestamp: Math.floor(Date.now() / 1000),
    address: '0:4d5c0210b35daddaa219fac459dba0fdefb1fae4e97a0d0797739fe050d694ca',
    domain: 'demo-dapp.walletbot.net',
    payload: {
        type: 'text',
        text: 'I confirm this test signature request.'
    }
};

const MOCK_SIGN_MESSAGE_RESULT: SignMessageResponse = {
    internalBoc: 'te6ccgEBAQEAAgAAAA=='
};

function buildActionOptions(surface: PreviewSurface, trigger: PreviewTrigger) {
    const modals = surface === 'modal' ? ([trigger] as ActionTrigger[]) : [];
    const notifications = surface === 'notification' ? ([trigger] as ActionTrigger[]) : [];

    return {
        modals,
        notifications,
        skipRedirectToWallet: 'always' as const,
        traceId: 'widget-builder-preview'
    };
}

function getMockResult(method: PreviewMethod) {
    if (method === 'signData') {
        return MOCK_SIGN_DATA_RESULT;
    }

    if (method === 'signMessage') {
        return MOCK_SIGN_MESSAGE_RESULT;
    }

    return MOCK_SEND_TRANSACTION_RESULT;
}

export function installPreviewRequestMocks(
    connector: ITonConnect,
    method: PreviewMethod,
    trigger: PreviewTrigger
): () => void {
    const originalSendTransaction = connector.sendTransaction.bind(connector);
    const originalSignData = connector.signData.bind(connector);
    const originalSignMessage = connector.signMessage.bind(connector);

    const hang = () =>
        new Promise<never>(() => {
            // Keep the preview action modal open.
        });

    const mockImpl = () => {
        if (trigger === 'before') {
            return hang();
        }

        if (trigger === 'success') {
            return Promise.resolve(getMockResult(method));
        }

        return Promise.reject(new TonConnectError('Preview mock error'));
    };

    connector.sendTransaction = ((...args: Parameters<ITonConnect['sendTransaction']>) =>
        method === 'sendTransaction'
            ? mockImpl()
            : originalSendTransaction(...args)) as ITonConnect['sendTransaction'];

    connector.signData = ((...args: Parameters<ITonConnect['signData']>) =>
        method === 'signData' ? mockImpl() : originalSignData(...args)) as ITonConnect['signData'];

    connector.signMessage = ((...args: Parameters<ITonConnect['signMessage']>) =>
        method === 'signMessage'
            ? mockImpl()
            : originalSignMessage(...args)) as ITonConnect['signMessage'];

    return () => {
        connector.sendTransaction = originalSendTransaction;
        connector.signData = originalSignData;
        connector.signMessage = originalSignMessage;
    };
}

export async function applyPreviewAction(
    tonConnectUI: TonConnectUI,
    params: {
        method: PreviewMethod;
        surface: PreviewSurface;
        trigger: PreviewTrigger;
    }
): Promise<() => void> {
    await resetPreviewActionUi(tonConnectUI);

    if (params.surface === 'notification') {
        await resetNotificationPreviewDedupe();
    }

    const cleanup = installPreviewRequestMocks(
        tonConnectUI.connector,
        params.method,
        params.trigger
    );

    const actionOptions = buildActionOptions(params.surface, params.trigger);

    const runAction = async () => {
        if (params.method === 'sendTransaction') {
            await tonConnectUI.sendTransaction(buildDefaultTx(), actionOptions);
        } else if (params.method === 'signData') {
            await tonConnectUI.signData(defaultPayloadFor('text'), actionOptions);
        } else {
            await tonConnectUI.signMessage(buildDefaultSignMessage(), actionOptions);
        }
    };

    try {
        if (params.trigger === 'before') {
            void runAction().catch(() => {
                // Action previews may reject when the user closes the modal.
            });
        } else {
            await runAction();
        }
    } catch {
        // Action previews may reject on error trigger.
    } finally {
        if (params.trigger !== 'before') {
            cleanup();
        }
    }

    return cleanup;
}
