import { ConnectRequest, RawDraftPayload } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors';
import { DraftMethod, DraftResponses } from 'src/models/methods/drafts';

export interface DraftSerializeParams {
    connectRequest?: ConnectRequest;
}

export abstract class DraftParser<TMethod extends DraftMethod> {
    abstract serialize(request: unknown, params: DraftSerializeParams): Omit<RawDraftPayload, 'id'>;

    abstract convertFromResponse(response: unknown): DraftResponses[TMethod];

    abstract parseAndThrowError(response: { error: { code: number; message: string } }): never;

    isError(response: unknown): response is { error: { code: number; message: string } } {
        return typeof response === 'object' && response !== null && 'error' in response;
    }

    protected throwMappedError(
        errorMap: Partial<Record<number, typeof TonConnectError>>,
        response: { error: { code: number; message: string } }
    ): never {
        const ErrorConstructor = errorMap[response.error.code] ?? errorMap[0]!;
        throw new ErrorConstructor(response.error.message);
    }
}
