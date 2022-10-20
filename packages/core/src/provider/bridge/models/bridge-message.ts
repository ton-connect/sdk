import { BridgeError } from 'src/provider/bridge/models/bridge-error';
import { BridgeEvent } from 'src/provider/bridge/models/bridge-event';

export type BridgeMessage = { error: BridgeError } | { event: BridgeEvent };
