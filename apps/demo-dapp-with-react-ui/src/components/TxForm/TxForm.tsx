import { useCallback, useState } from 'react';
import { beginCell } from '@ton/ton';
import ReactJson, { InteractionProps } from 'react-json-view';
import './style.scss';
import { SendTransactionRequest, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { TonProofDemoApi } from '../../TonProofDemoApi';
import { CHAIN } from '@tonconnect/ui-react';

// In this example, we are using a predefined smart contract state initialization (`stateInit`)
// to interact with an "EchoContract". This contract is designed to send the value back to the sender,
// serving as a testing tool to prevent users from accidentally spending money.

const defaultBody = beginCell().storeUint(0, 32).storeStringTail('Hello!').endCell();

const defaultTx: SendTransactionRequest = {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
        {
            address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
            amount: '5000000',
            // (optional) Body in boc base64 format.
            payload: defaultBody.toBoc().toString('base64'),
            // (optional) State init in boc base64 format.
            stateInit:
                'te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA=='
        }
    ]
};

const defaultTxWithMessages: SendTransactionRequest = {
    validUntil: Math.floor(Date.now() / 1000) + 600,
    items: [
        {
            type: 'ton',
            address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
            amount: '5000000',
            // (optional) Body in boc base64 format.
            payload: defaultBody.toBoc().toString('base64'),
            // (optional) State init in boc base64 format.
            stateInit:
                'te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA=='
        },
        {
            type: 'jetton',
            master: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            amount: '50000',
            destination: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M'
        }
    ]
};

export function TxForm() {
    const [tx, setTx] = useState(defaultTx);
    const [waitForTx, setWaitForTx] = useState(false);
    const [withConnect, setWithConnect] = useState(false);
    const [txResult, setTxResult] = useState<object | null>(null);
    const [loading, setLoading] = useState(false);
    const [waitingTx, setWaitingTx] = useState(false);
    const [signLoading, setSignLoading] = useState(false);
    const [signResult, setSignResult] = useState<object | null>(null);

    const wallet = useTonWallet();
    const [tonConnectUi] = useTonConnectUI();

    const onChange = useCallback((value: InteractionProps) => {
        setTx(value.updated_src as SendTransactionRequest);
    }, []);

    const buildNftItemsPayload = (): SendTransactionRequest => {
        const newOwner =
            wallet?.account?.address ?? 'TODO: connect a wallet to fill the new owner address';
        return {
            validUntil: Math.floor(Date.now() / 1000) + 600,
            items: [
                {
                    type: 'nft',
                    nftAddress: 'TODO: paste NFT item contract address',
                    newOwner
                }
            ]
        };
    };

    const handleSignMessage = async () => {
        setSignResult(null);
        setSignLoading(true);
        try {
            const result = await tonConnectUi.signMessage(tx, {
                onConnected: withConnect
                    ? (send, { dispatched }) => {
                          if (dispatched && !confirm('Sign message twice?')) {
                              throw new Error('Sign message twice');
                          }
                          return send();
                      }
                    : undefined
            });
            setSignResult(result);
            console.debug('Success tonConnectUi.signMessage', result);
        } catch (error) {
            console.error('Error tonConnectUi.signMessage', error);
        } finally {
            setSignLoading(false);
        }
    };

    const handleSendTx = async () => {
        setTxResult(null);
        setLoading(true);
        setWaitingTx(false);
        try {
            const transaction = await tonConnectUi.sendTransaction(tx, {
                onConnected: withConnect
                    ? (send, { dispatched }) => {
                          if (dispatched && !confirm('Send message twice?')) {
                              throw new Error('Send message twice');
                          }
                          return send();
                      }
                    : undefined
            });
            console.debug('Success tonConnectUi.sendTransaction', transaction);
            if (waitForTx && wallet && wallet.account && transaction) {
                setWaitingTx(true);
                const network = wallet.account.chain === CHAIN.TESTNET ? 'testnet' : 'mainnet';
                const txBoc = transaction.boc;
                const result = await TonProofDemoApi.waitForTransaction(txBoc, network);
                setTxResult(result);
                setWaitingTx(false);
            }
        } catch (err) {
            console.error('Error tonConnectUi.sendTransaction', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="send-tx-form">
            <h3>Configure and send transaction</h3>
            <button onClick={() => setTx(defaultTx)}>Set message payload</button>
            <button onClick={() => setTx(defaultTxWithMessages)}>Set items payload</button>
            <button onClick={() => setTx(buildNftItemsPayload())}>Set NFT items payload</button>
            <label
                style={{ margin: '12px 0 0 2px', color: '#b8d4f1', fontWeight: 500, fontSize: 15 }}
            >
                <input
                    type="checkbox"
                    checked={withConnect}
                    onChange={e => setWithConnect(e.target.checked)}
                />
                Embed request in connect
            </label>

            <ReactJson
                theme="ocean"
                src={tx}
                onEdit={onChange}
                onAdd={onChange}
                onDelete={onChange}
            />

            <label
                style={{ margin: '12px 0 0 2px', color: '#b8d4f1', fontWeight: 500, fontSize: 15 }}
            >
                <input
                    type="checkbox"
                    checked={waitForTx}
                    onChange={e => setWaitForTx(e.target.checked)}
                    style={{ marginRight: 8 }}
                />
                Wait for transaction confirmation
            </label>

            {waitForTx && (
                <div style={{ margin: '8px 0 0 2px', color: '#b8d4f1', fontSize: 15 }}>
                    {waitingTx ? (
                        <>
                            <span style={{ marginRight: 8 }}>
                                Waiting for transaction confirmation...
                            </span>
                            <span
                                className="loader"
                                style={{
                                    display: 'inline-block',
                                    width: 18,
                                    height: 18,
                                    border: '3px solid #66aaee',
                                    borderTop: '3px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    verticalAlign: 'middle'
                                }}
                            ></span>
                        </>
                    ) : (
                        <span>The transaction will be automatically found and shown below</span>
                    )}
                </div>
            )}

            {wallet || withConnect ? (
                <>
                    <button onClick={handleSendTx} disabled={loading || waitingTx}>
                        {loading ? 'Sending...' : 'Send transaction'}
                    </button>
                    <button onClick={handleSignMessage} disabled={signLoading}>
                        {signLoading ? 'Signing...' : 'Sign message'}
                    </button>
                </>
            ) : (
                <button onClick={() => tonConnectUi.openModal()}>
                    Connect wallet to send the transaction
                </button>
            )}

            {txResult && (
                <>
                    <div className="find-transaction-demo__json-label">Transaction</div>
                    <div className="find-transaction-demo__json-view">
                        <ReactJson src={txResult} name={false} theme="ocean" collapsed={false} />
                    </div>
                </>
            )}

            {signResult && (
                <>
                    <div className="find-transaction-demo__json-label">Sign Message Result</div>
                    <div className="find-transaction-demo__json-view">
                        <ReactJson src={signResult} name={false} theme="ocean" collapsed={false} />
                    </div>
                </>
            )}

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
