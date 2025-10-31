import { useState, useMemo } from 'react';
import { useTonConnectUI, useTonWallet, CHAIN } from '@tonconnect/ui-react';
import './style.scss';

export function NetworkPicker() {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const [customChainId, setCustomChainId] = useState('');
    const [desired, setDesired] = useState<string | undefined>(() =>
        tonConnectUI.connector.getDesiredChainId()
    );

    const connectedChainId = wallet?.account?.chain;
    const isMainnet = useMemo(() => desired === CHAIN.MAINNET, [desired]);
    const isTestnet = useMemo(() => desired === CHAIN.TESTNET, [desired]);

    return (
        <div className="network-picker">
            <div className="network-picker__title">Network</div>
            <div className="network-picker__row">
                <button
                    className={`np-btn ${isMainnet ? 'np-btn--active' : ''}`}
                    onClick={() => {
                        tonConnectUI.connector.setDesiredChainId(CHAIN.MAINNET);
                        setDesired(CHAIN.MAINNET);
                    }}
                >
                    Mainnet
                </button>
                <button
                    className={`np-btn ${isTestnet ? 'np-btn--active' : ''}`}
                    onClick={() => {
                        tonConnectUI.connector.setDesiredChainId(CHAIN.TESTNET);
                        setDesired(CHAIN.TESTNET);
                    }}
                >
                    Testnet
                </button>
                <button
                    className={`np-btn np-btn--ghost ${!desired ? 'np-btn--active' : ''}`}
                    onClick={() => {
                        tonConnectUI.connector.setDesiredChainId(undefined);
                        setDesired(undefined);
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
                        tonConnectUI.connector.setDesiredChainId(next);
                        setDesired(next);
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
        </div>
    );
}
