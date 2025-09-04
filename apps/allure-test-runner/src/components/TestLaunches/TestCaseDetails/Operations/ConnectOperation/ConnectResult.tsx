import { TestCaseExpandableSection } from '../../TestCaseExpandableSection';
import { ValidationStatus } from '../../ValidationStatus';

type ConnectResultProps = {
    connectResult?: Record<string, unknown> | undefined;
    isResultValid: boolean | undefined;
    validationErrors: string[];
    walletAddress?: string;
};

export function ConnectResult({
    connectResult,
    isResultValid,
    validationErrors,
    walletAddress
}: ConnectResultProps) {
    if (!connectResult && !walletAddress) return null;

    const getConnectionInfo = (result: Record<string, unknown>) => {
        if (result.event === 'connect' && result.payload) {
            const payload = result.payload as any;
            const tonAddrItem = payload.items?.find((item: any) => item.name === 'ton_addr');
            return {
                event: result.event,
                id: result.id,
                address: tonAddrItem?.address,
                network: tonAddrItem?.network,
                device: payload.device,
                features: payload.device?.features
            };
        }
        return result;
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
                                <strong>Address:</strong> {connectionInfo.address}
                            </div>
                            <div className="connection-detail">
                                <strong>Network:</strong>{' '}
                                {connectionInfo.network === '-239'
                                    ? 'Mainnet'
                                    : connectionInfo.network === '-3'
                                      ? 'Testnet'
                                      : connectionInfo.network}
                            </div>
                            {connectionInfo.device && (
                                <>
                                    <div className="connection-detail">
                                        <strong>Device:</strong> {connectionInfo.device.platform}
                                    </div>
                                    <div className="connection-detail">
                                        <strong>App:</strong> {connectionInfo.device.appName} v
                                        {connectionInfo.device.appVersion}
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
