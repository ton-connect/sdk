import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useState } from 'react';

type ConnectActionsProps = {
    onConnect: () => Promise<void>;
};

export function ConnectActions({ onConnect }: ConnectActionsProps) {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const handleDisconnect = async () => {
        if (!tonConnectUI) return;

        setIsDisconnecting(true);
        try {
            await tonConnectUI.disconnect();
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <div className="connect-wallet-actions">
            {wallet ? (
                <div className="wallet-disconnect-required">
                    <div className="wallet-disconnect-info">
                        <div className="wallet-disconnect-icon">⚠️</div>
                        <div className="wallet-disconnect-text">
                            <strong>Wallet Already Connected</strong>
                            <p>Please disconnect your wallet first to test the connection flow.</p>
                        </div>
                    </div>
                    <div className="wallet-connected-details">
                        <div className="wallet-info">
                            <strong>Connected:</strong> {'name' in wallet ? wallet.name : wallet.device.appName}
                        </div>
                        <div className="wallet-address">
                            {wallet.account.address.slice(0, 4)}...{wallet.account.address.slice(-4)}
                        </div>
                    </div>
                    <button
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        className="btn btn-warning disconnect-btn"
                    >
                        {isDisconnecting ? (
                            <>
                                <div className="disconnect-btn__spinner"></div>
                                Disconnecting...
                            </>
                        ) : (
                            'Disconnect Wallet'
                        )}
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => {
                        setIsConnecting(true);
                        onConnect().finally(() => setIsConnecting(false));
                    }}
                    disabled={isConnecting}
                    className="btn btn-primary connect-btn"
                >
                    {isConnecting ? (
                        <>
                            <div className="connect-btn__spinner"></div>
                            Connecting...
                        </>
                    ) : (
                        'Connect Wallet'
                    )}
                </button>
            )}
        </div>
    );
}
