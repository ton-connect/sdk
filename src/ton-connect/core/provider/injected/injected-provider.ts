import { ProviderEvent } from 'src/ton-connect/core/provider/models/provider-event';
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
    ): void {}

    sendRequest(request: ProviderRequest): Promise<void> {
        return Promise.resolve(undefined);
    }
}
