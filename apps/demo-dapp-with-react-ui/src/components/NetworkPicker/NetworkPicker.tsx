import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTonConnectUI, useTonWallet, CHAIN } from '@tonconnect/ui-react';
import './style.scss';

export function NetworkPicker() {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const [customChainId, setCustomChainId] = useState('');
    const [desired, setDesired] = useState<string | undefined>(undefined);

    const connectedChainId = wallet?.account?.chain;
    const isMainnet = useMemo(() => desired === CHAIN.MAINNET, [desired]);
    const isTestnet = useMemo(() => desired === CHAIN.TESTNET, [desired]);

    useEffect(() => {
        tonConnectUI.setConnectRequestParameters(
            desired
                ? {
                      state: 'ready',
                      value: { network: desired }
                  }
                : null
        );
    }, [desired, tonConnectUI]);

    const handleSetDesired = useCallback((newDesired: string | undefined) => {
        console.debug('[NetworkPicker] Set desired network', {
            newDesired: String(newDesired)
        });
        setDesired(newDesired);
    }, []);

    return (
        <div className="network-picker">
            <div className="network-picker__title">Network</div>
            <div className="network-picker__row">
                <button
                    className={`np-btn ${isMainnet ? 'np-btn--active' : ''}`}
                    onClick={() => {
                        handleSetDesired(CHAIN.MAINNET);
                    }}
                >
                    Mainnet
                </button>
                <button
                    className={`np-btn ${isTestnet ? 'np-btn--active' : ''}`}
                    onClick={() => {
                        handleSetDesired(CHAIN.TESTNET);
                    }}
                >
                    Testnet
                </button>
                <button
                    className={`np-btn np-btn--ghost ${!desired ? 'np-btn--active' : ''}`}
                    onClick={() => {
                        handleSetDesired(undefined);
                    }}
                >
                    Clear
                </button>
            </div>
            <div className="network-picker__row">
                <input
                    className="np-input"
                    placeholder="Custom chainId (e.g. -239, -3, my-chain)"
                    value={customChainId}
                    onChange={e => setCustomChainId(e.target.value)}
                />
                <button
                    className="np-btn"
                    onClick={() => {
                        const next = customChainId || undefined;
                        handleSetDesired(next);
                    }}
                >
                    Set
                </button>
            </div>
            <div className="network-picker__meta">
                <div>
                    <span className="np-meta-label">Desired chainId:</span>
                    <span className="np-meta-value">{desired ?? '—'}</span>
                </div>
                <div>
                    <span className="np-meta-label">Connected chainId:</span>
                    <span className="np-meta-value">{connectedChainId ?? '—'}</span>
                </div>
            </div>
            {wallet && desired && String(connectedChainId) !== String(desired) && (
                <div className="network-picker__warning">
                    Network changed. Please reconnect to apply the new network.
                    <button
                        className="np-btn"
                        style={{ marginLeft: 8 }}
                        onClick={async () => {
                            try {
                                console.debug(
                                    '[NetworkPicker] Manual disconnect to apply network',
                                    {
                                        connectedChainId: String(connectedChainId),
                                        desired: String(desired)
                                    }
                                );
                                await tonConnectUI.disconnect();
                            } catch {}
                        }}
                    >
                        Reconnect
                    </button>
                </div>
            )}
        </div>
    );
}
