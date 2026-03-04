import { ConnectRequest } from '../connect-request';
import { SignDataPayload } from '../../wallet-message/wallet-response/sign-data-rpc-response';

export interface MakeSignDataIntentRequest {
    id: string;
    m: 'signIntent';
    c?: ConnectRequest; // optional - see Intents section
    n?: string; // target network; semantics match signData
    mu?: string; // tonconnect-manifest URL used for domain binding. If not provided and c.manifestUrl exists, wallet will extract manifestUrl from c.manifestUrl
    p: SignDataPayload; // one of the payload types (Text, Binary, or Cell). Note that `network` and `from` fields from the payload types are ignored in intents, as they are specified at the intent level.
}
