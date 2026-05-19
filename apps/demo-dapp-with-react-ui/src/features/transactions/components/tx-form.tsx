import { useCallback, useState } from 'react';
import { beginCell } from '@ton/ton';
import ReactJson, { InteractionProps } from 'react-json-view';
import { CHAIN, SendTransactionRequest, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

import { Button } from '@/core/components/ui/button';
import { Skeleton } from '@/core/components/ui/skeleton';
import { TonProofDemoApi } from '@/core/lib/ton-proof-demo-api';

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
            payload: defaultBody.toBoc().toString('base64'),
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
            payload: defaultBody.toBoc().toString('base64'),
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

type RetryPrompt =
    | { kind: 'sendTx'; dispatched: boolean }
    | { kind: 'signMessage'; dispatched: boolean };

const CHECKBOX_LABEL_CLS = 'ml-[2px] mt-3 text-[15px] font-medium text-secondary-foreground';
const JSON_LABEL_CLS =
    'mb-[6px] ml-[2px] mt-[18px] self-start text-[15px] font-medium tracking-[0.01em] text-secondary-foreground';

export function TxForm() {
    const [tx, setTx] = useState(defaultTx);
    const [waitForTx, setWaitForTx] = useState(false);
    const [withConnect, setWithConnect] = useState(false);
    const [txResult, setTxResult] = useState<object | null>(null);
    const [loading, setLoading] = useState(false);
    const [waitingTx, setWaitingTx] = useState(false);
    const [signLoading, setSignLoading] = useState(false);
    const [signResult, setSignResult] = useState<object | null>(null);
    const [retryPrompt, setRetryPrompt] = useState<RetryPrompt | null>(null);

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

    const handleSendTx = async () => {
        setTxResult(null);
        setRetryPrompt(null);
        setLoading(true);
        setWaitingTx(false);
        try {
            let transaction;
            if (withConnect) {
                const embedded = await tonConnectUi.sendTransaction(tx, {
                    enableEmbeddedRequest: true
                });
                if (!embedded.hasResponse) {
                    setRetryPrompt({
                        kind: 'sendTx',
                        dispatched: embedded.connectResult.dispatched
                    });
                    return;
                }
                transaction = embedded.response;
            } else {
                transaction = await tonConnectUi.sendTransaction(tx);
            }
            console.debug('Success tonConnectUi.sendTransaction', transaction);
            if (waitForTx && wallet && wallet.account) {
                setWaitingTx(true);
                const network = wallet.account.chain === CHAIN.TESTNET ? 'testnet' : 'mainnet';
                const result = await TonProofDemoApi.waitForTransaction(transaction.boc, network);
                setTxResult(result);
                setWaitingTx(false);
            } else {
                setTxResult(transaction);
            }
        } catch (err) {
            console.error('Error tonConnectUi.sendTransaction', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignMessage = async () => {
        setSignResult(null);
        setRetryPrompt(null);
        setSignLoading(true);
        try {
            let result;
            if (withConnect) {
                const embedded = await tonConnectUi.signMessage(tx, {
                    enableEmbeddedRequest: true
                });
                if (!embedded.hasResponse) {
                    setRetryPrompt({
                        kind: 'signMessage',
                        dispatched: embedded.connectResult.dispatched
                    });
                    return;
                }
                result = embedded.response;
            } else {
                result = await tonConnectUi.signMessage(tx);
            }
            setSignResult(result);
            console.debug('Success tonConnectUi.signMessage', result);
        } catch (error) {
            console.error('Error tonConnectUi.signMessage', error);
        } finally {
            setSignLoading(false);
        }
    };

    return (
        <div className="flex w-full flex-1 flex-col items-center gap-5 p-5">
            <h3 className="text-[28px] text-foreground/80">Configure and send transaction</h3>
            <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => setTx(defaultTx)}>Set message payload</Button>
                <Button onClick={() => setTx(defaultTxWithMessages)}>Set items payload</Button>
                <Button onClick={() => setTx(buildNftItemsPayload())}>Set NFT items payload</Button>
            </div>
            <label className={CHECKBOX_LABEL_CLS}>
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

            <label className={CHECKBOX_LABEL_CLS}>
                <input
                    type="checkbox"
                    checked={waitForTx}
                    onChange={e => setWaitForTx(e.target.checked)}
                    className="mr-2"
                />
                Wait for transaction confirmation
            </label>

            {waitForTx && (
                <div className="ml-[2px] mt-2 flex items-center gap-2 text-[15px] text-secondary-foreground">
                    {waitingTx ? (
                        <>
                            <span>Waiting for transaction confirmation...</span>
                            <Skeleton className="h-[18px] w-[120px]" />
                        </>
                    ) : (
                        <span>The transaction will be automatically found and shown below</span>
                    )}
                </div>
            )}

            {wallet || withConnect ? (
                <div className="flex flex-wrap justify-center gap-3">
                    <Button
                        onClick={handleSendTx}
                        loading={loading}
                        disabled={waitingTx || Boolean(retryPrompt)}
                    >
                        Send transaction
                    </Button>
                    <Button
                        onClick={handleSignMessage}
                        loading={signLoading}
                        disabled={Boolean(retryPrompt)}
                    >
                        Sign message
                    </Button>
                </div>
            ) : (
                <Button onClick={() => tonConnectUi.openModal()}>
                    Connect wallet to send the transaction
                </Button>
            )}

            {retryPrompt && (
                <div
                    className={`my-3 rounded-lg border p-3 text-sm leading-[1.45] text-foreground ${
                        retryPrompt.dispatched
                            ? 'border-error/40 bg-error/15'
                            : 'border-primary/40 bg-primary/10'
                    }`}
                >
                    <strong>
                        {retryPrompt.dispatched ? '⚠️ Possible duplicate' : 'Request not delivered'}
                    </strong>
                    <p className="mb-2.5 mt-1.5">
                        {retryPrompt.dispatched ? (
                            <>
                                The {retryPrompt.kind === 'sendTx' ? 'transaction' : 'message'} was
                                delivered to the wallet inside the connect URL, but no response came
                                back. The wallet may have already processed it. Check your wallet
                                history (or the destination address on-chain) before retrying — a
                                blind retry can result in a duplicate transaction.
                            </>
                        ) : (
                            <>
                                The wallet connected but did not receive the request. It is safe to
                                send it again over the bridge.
                            </>
                        )}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={
                                retryPrompt.kind === 'sendTx' ? handleSendTx : handleSignMessage
                            }
                        >
                            Retry{' '}
                            {retryPrompt.kind === 'sendTx' ? 'transaction' : 'message signing'}
                        </Button>
                        <Button variant="ghost" onClick={() => setRetryPrompt(null)}>
                            Dismiss
                        </Button>
                    </div>
                </div>
            )}

            {txResult && (
                <>
                    <div className={JSON_LABEL_CLS}>Transaction</div>
                    <div className="w-full">
                        <ReactJson src={txResult} name={false} theme="ocean" collapsed={false} />
                    </div>
                </>
            )}

            {signResult && (
                <>
                    <div className={JSON_LABEL_CLS}>Sign Message Result</div>
                    <div className="w-full">
                        <ReactJson src={signResult} name={false} theme="ocean" collapsed={false} />
                    </div>
                </>
            )}
        </div>
    );
}
