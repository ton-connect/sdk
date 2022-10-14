import { BridgeError } from 'src/ton-connect/core/provider/bridge/models/bridge-error';
import { BridgeEvent } from 'src/ton-connect/core/provider/bridge/models/bridge-event';

export type BridgeMessage = { error: BridgeError } | { event: BridgeEvent };
