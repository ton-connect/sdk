import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useState } from 'react';

type ConnectActionsProps = {
    onConnect: () => Promise<void>;
    onAbort: () => void;
    isConnecting: boolean;
};

export function ConnectActions({
    onConnect,
    onAbort,
    isConnecting: isConnectingFromHook
}: ConnectActionsProps) {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
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
                <div className="connect-actions-container">
                    {isConnectingFromHook ? (
                        <>
                            <button onClick={onAbort} className="btn btn-danger abort-btn">
                                Abort Connection
                            </button>
                            <div className="connecting-status">
                                <div className="connect-btn__spinner"></div>
                                <span>Waiting for wallet connection...</span>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={onConnect}
                            disabled={isConnectingFromHook}
                            className="btn btn-primary connect-btn"
                        >
                            Connect Wallet
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
