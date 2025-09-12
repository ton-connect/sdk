import { toUserFriendlyAddress } from '@tonconnect/ui-react';
import { TestCaseExpandableSection } from '../../TestCaseExpandableSection';
import { ValidationStatus } from '../../ValidationStatus';
import { CheckCircle, Wallet } from 'lucide-react';
import { useMemo } from 'react';

type ConnectResultProps = {
    connectResult?: Record<string, unknown> | undefined;
    isResultValid: boolean | undefined;
    validationErrors: string[];
    walletAddress?: string;
};

type ConnectionInfo = {
    event: unknown;
    id: unknown;
    address: string | undefined;
    network: string | undefined;
    device: Record<string, unknown> | undefined;
    features: unknown;
};

export function ConnectResult({
    connectResult,
    isResultValid,
    validationErrors,
    walletAddress
}: ConnectResultProps) {
    if (!connectResult && !walletAddress) return null;

    const getConnectionInfo = (result: Record<string, unknown>): ConnectionInfo | null => {
        if (result.event === 'connect' && result.payload) {
            const payload = result.payload as Record<string, unknown>;
            const items = payload.items as Array<Record<string, unknown>> | undefined;
            const tonAddrItem = items?.find(
                (item: Record<string, unknown>) => item.name === 'ton_addr'
            );
            const device = payload.device as Record<string, unknown> | undefined;
            return {
                event: result.event,
                id: result.id,
                address: tonAddrItem?.address as string | undefined,
                network: tonAddrItem?.network as string | undefined,
                device: device,
                features: device?.features
            };
        }
        return null;
    };

    const connectionInfo = connectResult ? getConnectionInfo(connectResult) : null;

    const walletFriendlyAddress = useMemo(() => {
        let walletAddress = null;
        try {
            if (connectionInfo?.address) {
                walletAddress = toUserFriendlyAddress(connectionInfo.address);
            }
        } catch (error) {}
        return walletAddress;
    }, [connectionInfo]);

    return (
        <>
            {connectResult && (
                <TestCaseExpandableSection
                    title="Connection Result"
                    data={JSON.stringify(connectResult, null, 2)}
                />
            )}

            {connectionInfo && connectionInfo.event === 'connect' && (
                <div className="bg-green-950/20 border border-green-800/40 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <div className="font-medium text-green-400">
                            Wallet Connected Successfully
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Address:</span>
                            <span className="font-mono text-foreground">
                                {walletFriendlyAddress ? walletFriendlyAddress : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Network:</span>
                            <span className="text-foreground">
                                {connectionInfo.network === '-239'
                                    ? 'Mainnet'
                                    : connectionInfo.network === '-3'
                                      ? 'Testnet'
                                      : connectionInfo.network || 'N/A'}
                            </span>
                        </div>
                        {connectionInfo.device && (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Device:</span>
                                    <span className="text-foreground">
                                        {(connectionInfo.device.platform as string) || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">App:</span>
                                    <span className="text-foreground">
                                        {(connectionInfo.device.appName as string) || 'N/A'} v
                                        {(connectionInfo.device.appVersion as string) || 'N/A'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {walletAddress && !connectionInfo && (
                <div className="bg-blue-950/20 border border-blue-800/40 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                        <Wallet className="h-4 w-4 text-blue-400 flex-shrink-0" />
                        <div className="flex justify-between w-full">
                            <span className="text-blue-400 font-medium">Connected Wallet:</span>
                            <span className="font-mono text-foreground">{walletAddress}</span>
                        </div>
                    </div>
                </div>
            )}

            <ValidationStatus isResultValid={isResultValid} validationErrors={validationErrors} />
        </>
    );
}
