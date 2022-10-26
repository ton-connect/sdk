import { ConnectEvent } from './connect-event';
import { DisconnectEvent } from './disconnect-event';

export type WalletEvent = ConnectEvent | DisconnectEvent;
