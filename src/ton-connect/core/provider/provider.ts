import { InjectedProvider } from 'src/ton-connect/core/provider/injected/injected-provider';
import { ProviderError } from 'src/ton-connect/core/provider/models/provider-error';
import { ProviderEvent } from 'src/ton-connect/core/provider/models/provider-event';
import { ProviderRequest } from './models/provider-request';

export type Provider = InjectedProvider | HTTPProvider;

export interface InternalProvider extends BaseProvider {
    connect(): Promise<void>;
}

export interface HTTPProvider extends BaseProvider {
    connect(): Promise<string>;
}

interface BaseProvider {
    disconnect(): Promise<void>;
    sendRequest(request: ProviderRequest): Promise<void>;
    listen(
        eventsCallback: (e: ProviderEvent) => void,
        errorsCallback?: (e: ProviderError) => void
    ): void;
}
