import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { useState } from 'react';
import { Button } from '../../../../ui/button';
import { Loader2, AlertTriangle, Unplug, Wifi } from 'lucide-react';

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
        <div className="space-y-2">
            {wallet ? (
                <>
                    <div className="p-2 bg-yellow-950/20 border border-yellow-800/40 rounded text-xs">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="font-medium text-yellow-300">Wallet Connected</div>
                                <div className="text-yellow-400">
                                    Disconnect to test connection flow
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        variant="outline"
                        size="sm"
                        className="w-full"
                    >
                        {isDisconnecting ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Disconnecting...
                            </>
                        ) : (
                            <>
                                <Unplug className="h-3 w-3 mr-1" />
                                Disconnect
                            </>
                        )}
                    </Button>
                </>
            ) : (
                <>
                    {isConnectingFromHook ? (
                        <>
                            <div className="p-2 bg-blue-950/20 border border-blue-800/40 rounded text-xs">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin flex-shrink-0" />
                                    <span className="text-blue-300">Connecting to wallet...</span>
                                </div>
                            </div>
                            <Button
                                onClick={onAbort}
                                variant="destructive"
                                size="sm"
                                className="w-full"
                            >
                                Abort Connection
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={onConnect}
                            disabled={isConnectingFromHook}
                            variant="default"
                            size="sm"
                            className="w-full"
                        >
                            <Wifi className="h-3 w-3 mr-1" />
                            Connect Wallet
                        </Button>
                    )}
                </>
            )}
        </div>
    );
}
