import { Inject, Injectable, InjectionToken } from '@angular/core';
import {
  ActionConfiguration,
  ConnectedWallet,
  Locales,
  TonConnectUI,
  TonConnectUiOptions,
  UIPreferences,
  WalletsListConfiguration,
} from '@tonconnect/ui';
import {
  BehaviorSubject,
  Observable,
  filter,
  from,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';

export type TonConnectUIOptions = Partial<ITonConnectUIOptionsBase> &
  Partial<ITonConnectUIOptionsWinManifest>;

export interface ITonConnectUIOptionsBase {
  manifestUrl: string;
  restoreConnection: boolean;
  language: Locales;
  uiPreferences?: UIPreferences;
  walletsListConfiguration?: WalletsListConfiguration;
  actionsConfiguration?: ActionConfiguration;
}

export interface ITonConnectUIOptionsWinManifest {
  manifestUrl: string;
}

export const TON_CONNECT_UI_OPTIONS = new InjectionToken<
  Observable<TonConnectUIOptions>
>('TON_CONNECT_UI_OPTIONS');

@Injectable()
export class TonConnectUIService {
  private readonly _tonConnectUI$ = this._options$.pipe(
    map((options) => new TonConnectUI(options)),
    shareReplay(1)
  );

  private readonly _connectedWallet$ =
    new BehaviorSubject<ConnectedWallet | null>(null);

  constructor(
    @Inject(TON_CONNECT_UI_OPTIONS)
    private readonly _options$: Observable<TonConnectUIOptions>
  ) {
    this._init();
  }

  get(): Observable<TonConnectUI> {
    return this._tonConnectUI$.pipe(filter(value => !!value), take(1));
  }

  getConnectedWallet(): Observable<ConnectedWallet | null> {
    return this._connectedWallet$.asObservable();
  }

  updateOptions(options: TonConnectUiOptions): void {
    this.get()
      .pipe(
        tap((connection) => (connection.uiOptions = options)),
        take(1)
      )
      .subscribe();
  }

  disconnectWallet(): Observable<void> {
    return this.get().pipe(
      switchMap((connection) => from(connection.disconnect())),
      map(() => undefined)
    );
  }

  restoreConnection(): Observable<boolean> {
    return this.get().pipe(
      switchMap((connection) => from(connection.connectionRestored))
    );
  }

  private _init(): void {
    this.get()
      .pipe(
        tap((connection) =>
          connection.onStatusChange((status) =>
            this._connectedWallet$.next(status)
          )
        )
      )
      .subscribe();
  }
}
