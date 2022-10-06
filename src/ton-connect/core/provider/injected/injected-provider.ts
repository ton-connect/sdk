import { ProviderError } from 'src/ton-connect/core/provider/models/provider-error';
import { ProviderEvent } from 'src/ton-connect/core/provider/models/provider-event';
import { ProviderRequest } from 'src/ton-connect/core/provider/models/provider-request';
import { InternalProvider } from 'src/ton-connect/core/provider/provider';

export class InjectedProvider implements InternalProvider {
    connect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    listen(
        eventsCallback: (e: ProviderEvent) => void,
        errorsCallback?: (e: ProviderError) => void
    ): void {
        return void eventsCallback || void errorsCallback;
    }

    sendRequest(request: ProviderRequest): Promise<void> {
        return Promise.resolve(void request);
    }
}
