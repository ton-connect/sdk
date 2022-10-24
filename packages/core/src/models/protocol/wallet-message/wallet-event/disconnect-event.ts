import { WalletEventTemplate } from './wallet-event-template';

export interface DisconnectEvent extends WalletEventTemplate {
    type: 'disconnect';
    payload: {};
}
