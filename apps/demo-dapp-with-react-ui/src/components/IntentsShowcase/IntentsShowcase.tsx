import { useState, useEffect, useRef } from 'react';
import { beginCell } from '@ton/ton';
import { Link } from 'react-router-dom';
import { CHAIN, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { SendTransactionRequest } from '@tonconnect/ui-react';
import { IntentItem, MakeSendTransactionIntentRequest } from '@tonconnect/sdk';
import { Address, toNano } from '@ton/core';
import { TonProofDemoApi } from '../../TonProofDemoApi';
import './showcase.scss';

function getExplorerAddressUrl(address: string): string {
    return `https://tonviewer.com/address/${address}`;
}

function getExplorerTransactionUrl(hashHex: string): string {
    return `https://tonviewer.com/transaction/${hashHex}`;
}

function formatAddressDisplay(address: string): string {
    try {
        const friendly = Address.parse(address).toString({
            urlSafe: true,
            bounceable: false
        });
        if (friendly.length <= 16) return friendly;
        return `${friendly.slice(0, 6)}…${friendly.slice(-6)}`;
    } catch {
        if (address.length <= 16) return address;
        return `${address.slice(0, 6)}…${address.slice(-6)}`;
    }
}

const BEFORE_STEPS: Array<
    | { num: number; title: string; desc: string; action?: undefined }
    | { num: number; title: string; desc: string; action: 'connect' }
    | { num: number; title: string; desc: string; action: 'send' }
> = [
    { num: 1, title: 'Connect wallet', desc: 'Link your wallet to the dApp', action: 'connect' },
    { num: 2, title: 'Approve in wallet', desc: 'First approval — connection' },
    {
        num: 3,
        title: 'Submit payment',
        desc: 'Send 0.05 TON to Echo contract',
        action: 'send'
    },
    { num: 4, title: 'Approve in wallet', desc: 'Second approval — transaction' },
    { num: 5, title: 'Done', desc: 'Transaction sent ✓' }
];

const AFTER_STEPS: Array<
    | { num: number; title: string; desc: string; action?: undefined }
    | { num: number; title: string; desc: string; action: 'sendIntent' }
> = [
    {
        num: 1,
        title: 'Send',
        desc: 'One tap: connect + send, no prior connection',
        action: 'sendIntent'
    },
    { num: 2, title: 'Approve in wallet', desc: "Single approval and you're done" }
];

export function IntentsShowcase() {
    const [beforeSending, setBeforeSending] = useState(false);
    const [intentSending, setIntentSending] = useState(false);
    const [beforeComplete, setBeforeComplete] = useState(false);
    const [afterComplete, setAfterComplete] = useState(false);
    const [beforeSendClicked, setBeforeSendClicked] = useState(false);
    const [intentSendClicked, setIntentSendClicked] = useState(false);
    const [showAfterFlow, setShowAfterFlow] = useState(false);
    const [beforeTxResult, setBeforeTxResult] = useState<{ hashHex: string } | null>(null);
    const [afterTxResult, setAfterTxResult] = useState<{ hashHex: string } | null>(null);
    const [beforeWaitingTx, setBeforeWaitingTx] = useState(false);
    const [afterWaitingTx, setAfterWaitingTx] = useState(false);

    const afterFlowRef = useRef<HTMLElement>(null);
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();

    const beforeStepDone = [
        !!wallet,
        !!wallet,
        beforeSendClicked,
        beforeComplete,
        beforeComplete
    ] as const;
    const afterStepDone = [intentSendClicked, afterComplete] as const;

    useEffect(() => {
        const setupIntentConnect = async () => {
            const payload = await TonProofDemoApi.generatePayload();
            if (payload?.tonProof) {
                tonConnectUI.setIntentConnectRequestParameters?.({
                    includeConnect: true,
                    includeTonProof: true,
                    tonProofPayload: payload.tonProof
                });
            } else {
                tonConnectUI.setIntentConnectRequestParameters?.({
                    includeConnect: true,
                    includeTonProof: false
                });
            }
        };
        setupIntentConnect();
    }, [tonConnectUI]);

    useEffect(() => {
        const unsubscribe = tonConnectUI.onIntentResponse?.(
            (response: { result?: unknown; error?: unknown }) => {
                const boc = typeof response.result === 'string' ? response.result : null;
                if (boc) {
                    setAfterComplete(true);
                    setAfterWaitingTx(true);
                    TonProofDemoApi.waitForTransaction(boc, 'mainnet')
                        .then(tx => {
                            if (tx?.hashHex) setAfterTxResult({ hashHex: tx.hashHex });
                        })
                        .catch(() => {})
                        .finally(() => {
                            setAfterWaitingTx(false);
                        });
                }
            }
        );
        return () => unsubscribe?.();
    }, [tonConnectUI]);

    const handleConnect = () => {
        tonConnectUI.openModal?.();
    };

    const handleDisconnect = () => {
        void tonConnectUI.disconnect();
    };

    const carouselIndex = showAfterFlow ? 1 : 0;

    const handleShowAfterFlow = () => {
        setShowAfterFlow(true);
    };

    const handleBackToBefore = () => {
        setShowAfterFlow(false);
    };

    const handleBeforeSend = async () => {
        setBeforeSendClicked(true);
        setBeforeSending(true);
        setBeforeTxResult(null);
        try {
            const defaultTx: SendTransactionRequest = {
                validUntil: Math.ceil(Date.now() / 1000) + 10000,
                messages: [
                    {
                        address: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
                        amount: toNano(0.05).toString(),
                        payload: beginCell()
                            .storeUint(0, 32)
                            .storeStringTail('Connected!')
                            .endCell()
                            .toBoc()
                            .toString('base64'),
                        stateInit:
                            'te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA=='
                    }
                ]
            };
            const transaction = await tonConnectUI.sendTransaction(defaultTx);
            setBeforeComplete(true);
            if (transaction?.boc && wallet?.account?.chain !== undefined) {
                const network =
                    wallet.account.chain === CHAIN.TESTNET ? 'testnet' : 'mainnet';
                setBeforeWaitingTx(true);
                try {
                    const tx = await TonProofDemoApi.waitForTransaction(
                        transaction.boc,
                        network
                    );
                    if (tx?.hashHex) setBeforeTxResult({ hashHex: tx.hashHex });
                } catch {
                    // wait failed, still show complete
                } finally {
                    setBeforeWaitingTx(false);
                }
            }
        } catch (e) {
            console.error('Send failed:', e);
        } finally {
            setBeforeSending(false);
        }
    };

    const handleIntentSend = async () => {
        setIntentSendClicked(true);
        setIntentSending(true);
        const defaultIntentItem: IntentItem = {
            t: 'ton',
            p: beginCell()
                .storeUint(0, 32)
                .storeStringTail('Intent!')
                .endCell()
                .toBoc()
                .toString('base64'),
            a: 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M',
            am: toNano(0.05).toString()
        };

        const defaultIntentRequest: MakeSendTransactionIntentRequest = {
            id: Date.now().toString(),
            i: [defaultIntentItem],
            vu: Math.ceil(Date.now() / 1000) + 10000
        };
        try {
            await tonConnectUI.makeSendTransactionIntent({
                ...defaultIntentRequest,
                id: `intent-showcase-${Date.now()}`
            });
        } catch (e) {
            console.error('Intent send failed:', e);
        } finally {
            setIntentSending(false);
        }
    };

    const explorerUrl = wallet?.account?.address
        ? getExplorerAddressUrl(wallet.account.address)
        : null;

    return (
        <div className="intents-showcase">
            <header className="intents-showcase__header">
                <div className="intents-showcase__header-left">
                    <Link to="/" className="intents-showcase__back">
                        ← Back to demo
                    </Link>
                    <span className="intents-showcase__logo">TON Connect · Intents</span>
                </div>
                {wallet && (
                    <div className="intents-showcase__header-actions">
                        <span className="intents-showcase__header-address">
                            {formatAddressDisplay(wallet.account.address)}
                        </span>
                        <button
                            type="button"
                            className="intents-showcase__disconnect-btn"
                            onClick={handleDisconnect}
                        >
                            Disconnect
                        </button>
                    </div>
                )}
            </header>

            <main className="intents-showcase__main">
                <h1 className="intents-showcase__title">
                    Transaction flow,{' '}
                    <span className="intents-showcase__title-accent">simplified</span>
                </h1>
                <p className="intents-showcase__subtitle">
                    Intents let users send transactions without connecting first. One tap, one
                    approval.
                </p>

                <div className="intents-showcase__carousel">
                    <div
                        className="intents-showcase__carousel-track"
                        style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                    >
                        <div className="intents-showcase__carousel-slide">
                    <section className="intents-showcase__flow intents-showcase__flow--before intents-showcase__flow--enter">
                        <h2 className="intents-showcase__flow-title">
                            <span className="intents-showcase__flow-badge">Before</span>
                            How it was
                        </h2>
                        <p className="intents-showcase__flow-desc">
                            Five steps, two wallet approvals
                        </p>
                        <ol className="intents-showcase__steps">
                            {BEFORE_STEPS.map((step, index) => {
                                const done = beforeStepDone[index];
                                return (
                                    <li
                                        key={step.num}
                                        className={`intents-showcase__step intents-showcase__step--i-${step.num} ${done ? 'intents-showcase__step--done' : ''}`}
                                    >
                                        <div className="intents-showcase__step-track">
                                            <span
                                                className={`intents-showcase__step-num ${done ? 'intents-showcase__step-num--done' : ''}`}
                                                aria-hidden
                                            >
                                                {done ? (
                                                    <span className="intents-showcase__step-check">
                                                        ✓
                                                    </span>
                                                ) : (
                                                    step.num
                                                )}
                                            </span>
                                            {step.num < BEFORE_STEPS.length && (
                                                <div
                                                    className={`intents-showcase__step-connector ${done ? 'intents-showcase__step-connector--filled' : ''}`}
                                                    aria-hidden
                                                />
                                            )}
                                        </div>
                                        <div className="intents-showcase__step-content">
                                            <strong>{step.title}</strong>
                                            <span>{step.desc}</span>
                                            {step.action === 'connect' &&
                                                wallet?.account?.address && (
                                                    <div className="intents-showcase__wallet-address">
                                                        {formatAddressDisplay(
                                                            wallet.account.address
                                                        )}
                                                    </div>
                                                )}
                                            {step.action === 'connect' && !wallet && (
                                                <button
                                                    type="button"
                                                    className="intents-showcase__step-btn"
                                                    onClick={handleConnect}
                                                >
                                                    Connect wallet
                                                </button>
                                            )}
                                            {step.action === 'send' && (
                                                <button
                                                    type="button"
                                                    className="intents-showcase__step-btn"
                                                    onClick={handleBeforeSend}
                                                    disabled={!wallet || beforeSending}
                                                >
                                                    {beforeSending ? 'Sending…' : 'Submit payment'}
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                        {beforeComplete && (
                            <div className="intents-showcase__result">
                                {beforeWaitingTx && (
                                    <div className="intents-showcase__result-waiting-wrap">
                                        <div className="intents-showcase__loader" aria-hidden />
                                        <p className="intents-showcase__result-waiting">
                                            Waiting for transaction to appear on chain…
                                        </p>
                                    </div>
                                )}
                                {!beforeWaitingTx && beforeTxResult && (
                                    <div className="intents-showcase__explorer intents-showcase__explorer--row">
                                        <span className="intents-showcase__result-success">
                                            Transaction confirmed
                                        </span>
                                        <a
                                            href={getExplorerTransactionUrl(
                                                beforeTxResult.hashHex
                                            )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="intents-showcase__explorer-link"
                                        >
                                            Show transaction →
                                        </a>
                                    </div>
                                )}
                                {!beforeWaitingTx && !beforeTxResult && explorerUrl && (
                                    <div className="intents-showcase__explorer">
                                        <a
                                            href={explorerUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="intents-showcase__explorer-link"
                                        >
                                            Show transaction →
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                        {beforeComplete && (
                            <div className="intents-showcase__transition">
                                <button
                                    type="button"
                                    className="intents-showcase__transition-btn"
                                    onClick={handleShowAfterFlow}
                                >
                                    See how it is with Intents →
                                </button>
                            </div>
                        )}
                    </section>
                        </div>

                        {beforeComplete && (
                        <div className="intents-showcase__carousel-slide">
                            <button
                                type="button"
                                className="intents-showcase__back-btn"
                                onClick={handleBackToBefore}
                            >
                                ← Back
                            </button>
                        <section
                            ref={afterFlowRef}
                            className="intents-showcase__flow intents-showcase__flow--after intents-showcase__flow--reveal"
                        >
                            <h2 className="intents-showcase__flow-title">
                                <span className="intents-showcase__flow-badge intents-showcase__flow-badge--now">
                                    Now
                                </span>
                                How it is with Intents
                            </h2>
                            <p className="intents-showcase__flow-desc">Two steps, one approval</p>
                            <ol className="intents-showcase__steps">
                                {AFTER_STEPS.map((step, index) => {
                                    const done = afterStepDone[index];
                                    return (
                                        <li
                                            key={step.num}
                                            className={`intents-showcase__step intents-showcase__step--i-${step.num} ${done ? 'intents-showcase__step--done' : ''}`}
                                        >
                                            <div className="intents-showcase__step-track intents-showcase__step-track--accent">
                                                <span
                                                    className={`intents-showcase__step-num intents-showcase__step-num--accent ${done ? 'intents-showcase__step-num--done' : ''}`}
                                                    aria-hidden
                                                >
                                                    {done ? (
                                                        <span className="intents-showcase__step-check">
                                                            ✓
                                                        </span>
                                                    ) : (
                                                        step.num
                                                    )}
                                                </span>
                                                {step.num < AFTER_STEPS.length && (
                                                    <div
                                                        className={`intents-showcase__step-connector intents-showcase__step-connector--accent ${done ? 'intents-showcase__step-connector--filled' : ''}`}
                                                        aria-hidden
                                                    />
                                                )}
                                            </div>
                                            <div className="intents-showcase__step-content">
                                                <strong>{step.title}</strong>
                                                <span>{step.desc}</span>
                                                {step.action === 'sendIntent' && !afterComplete && (
                                                    <button
                                                        type="button"
                                                        className="intents-showcase__step-btn intents-showcase__step-btn--accent"
                                                        onClick={handleIntentSend}
                                                        disabled={intentSending}
                                                    >
                                                        {intentSending ? 'Opening…' : 'Send'}
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                            {afterComplete && (
                                <div className="intents-showcase__result">
                                    {afterWaitingTx && (
                                        <div className="intents-showcase__result-waiting-wrap">
                                            <div className="intents-showcase__loader intents-showcase__loader--accent" aria-hidden />
                                            <p className="intents-showcase__result-waiting">
                                                Waiting for transaction to appear on chain…
                                            </p>
                                        </div>
                                    )}
                                    {!afterWaitingTx && afterTxResult && (
                                        <div className="intents-showcase__explorer intents-showcase__explorer--row">
                                            <span className="intents-showcase__result-success">
                                                Transaction confirmed
                                            </span>
                                            <a
                                                href={getExplorerTransactionUrl(
                                                    afterTxResult.hashHex
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="intents-showcase__explorer-link"
                                            >
                                                Show transaction →
                                            </a>
                                        </div>
                                    )}
                                    {!afterWaitingTx && !afterTxResult && explorerUrl && (
                                        <div className="intents-showcase__explorer">
                                            <a
                                                href={explorerUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="intents-showcase__explorer-link"
                                            >
                                                Show transaction →
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                        </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
