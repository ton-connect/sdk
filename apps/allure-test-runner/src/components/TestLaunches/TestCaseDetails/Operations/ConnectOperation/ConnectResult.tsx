import { TestCaseExpandableSection } from '../../TestCaseExpandableSection';
import { ValidationStatus } from '../../ValidationStatus';

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

    return (
        <>
            {connectResult && (
                <TestCaseExpandableSection
                    title="Connection Result"
                    data={JSON.stringify(connectResult, null, 2)}
                    className="connection-result-json"
                />
            )}

            {connectionInfo && connectionInfo.event === 'connect' && (
                <div style={{ margin: '8px 0 0 2px' }}>
                    <div className="connection-success-info">
                        <div className="connection-success-header">
                            <span className="connection-success-icon">✅</span>
                            <strong>Wallet Connected Successfully</strong>
                        </div>
                        <div className="connection-details">
                            <div className="connection-detail">
                                <strong>Address:</strong> {connectionInfo.address || 'N/A'}
                            </div>
                            <div className="connection-detail">
                                <strong>Network:</strong>{' '}
                                {connectionInfo.network === '-239'
                                    ? 'Mainnet'
                                    : connectionInfo.network === '-3'
                                      ? 'Testnet'
                                      : connectionInfo.network || 'N/A'}
                            </div>
                            {connectionInfo.device && (
                                <>
                                    <div className="connection-detail">
                                        <strong>Device:</strong>{' '}
                                        {(connectionInfo.device.platform as string) || 'N/A'}
                                    </div>
                                    <div className="connection-detail">
                                        <strong>App:</strong>{' '}
                                        {(connectionInfo.device.appName as string) || 'N/A'} v
                                        {(connectionInfo.device.appVersion as string) || 'N/A'}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {walletAddress && !connectionInfo && (
                <div style={{ margin: '8px 0 0 2px' }}>
                    <div className="wallet-address-display">
                        <strong>Connected Wallet:</strong> {walletAddress}
                    </div>
                </div>
            )}

            <ValidationStatus isResultValid={isResultValid} validationErrors={validationErrors} />
        </>
    );
}
