import { OptionalTraceable } from 'src/utils/types';

export type BridgeIncomingMessage = OptionalTraceable<{
    from: string;
    message: string;
}>;
