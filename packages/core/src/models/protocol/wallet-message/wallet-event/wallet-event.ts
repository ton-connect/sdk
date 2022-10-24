import { ConnectEvent } from 'src/models/protocol/wallet-message/wallet-event/connect-event';
import { DisconnectEvent } from './disconnect-event';

export type WalletEvent = ConnectEvent | DisconnectEvent;
