import {
    ActionRequest,
    RequestType
} from 'src/ton-connect/core/models/protocol/actions/action-request';
import { ActionResponse } from 'src/ton-connect/core/models/protocol/actions/action-response';
import { InjectedProvider } from 'src/ton-connect/core/provider/injected/injected-provider';
import { ProviderError } from 'src/ton-connect/core/provider/models/provider-error';
import { ProviderEvent } from 'src/ton-connect/core/provider/models/provider-event';

export type Provider = InjectedProvider | HTTPProvider;

export interface InternalProvider extends BaseProvider {
    connect(): Promise<void>;
}

export interface HTTPProvider extends BaseProvider {
    connect(): Promise<string>;
}

interface BaseProvider {
    disconnect(): Promise<void>;
    sendRequest<T extends RequestType>(request: ActionRequest<T>): Promise<ActionResponse<T>>;
    listen(
        eventsCallback: (e: ProviderEvent) => void,
        errorsCallback?: (e: ProviderError) => void
    ): void;
}
