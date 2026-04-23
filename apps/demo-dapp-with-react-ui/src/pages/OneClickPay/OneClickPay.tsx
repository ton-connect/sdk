import './style.scss';
import { useMemo, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { oneClickGaslessPay, PayStage, USDT_MASTER } from './oneClickGaslessFlow';

const DEFAULT_RECIPIENT = 'UQAHIrW23uWY7KOOYz6axu7WlBdA8iGwncI_Y8ZTWZA43yXF';
const DEFAULT_AMOUNT_USDT = '0.05';

/** 6 decimals → elementary units. "0.05" → 50_000n */
function usdtToUnits(value: string): bigint {
    const [whole, frac = ''] = value.trim().split('.');
    const fracPadded = (frac + '000000').slice(0, 6);
    return BigInt(whole || '0') * 1_000_000n + BigInt(fracPadded || '0');
}

function shortAddr(a: string): string {
    return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-6)}` : a;
}

type Step = { key: string; label: string; index: number };
const STEPS: Step[] = [
    { key: 'estimating', label: 'Estimate fee', index: 1 },
    { key: 'signing', label: 'Sign', index: 2 },
    { key: 'submitting', label: 'Relay', index: 3 },
    { key: 'waiting-onchain', label: 'On-chain', index: 4 }
];

function activeStepIndex(stage: PayStage): number {
    switch (stage.name) {
        case 'estimating':
            return 1;
        case 'signing':
            return 2;
        case 'submitting':
            return 3;
        case 'waiting-onchain':
            return 4;
        case 'confirmed':
            return 5;
        default:
            return 0;
    }
}

export function OneClickPay() {
    const [tonConnectUi] = useTonConnectUI();
    const wallet = useTonWallet();

    const [recipient, setRecipient] = useState(DEFAULT_RECIPIENT);
    const [amountText, setAmountText] = useState(DEFAULT_AMOUNT_USDT);
    const [stage, setStage] = useState<PayStage>({ name: 'idle' });

    const amountUnits = useMemo(() => {
        try {
            return usdtToUnits(amountText);
        } catch {
            return 0n;
        }
    }, [amountText]);

    const amountValid = amountUnits > 0n;
    let recipientValid = false;
    try {
        Address.parse(recipient);
        recipientValid = true;
    } catch {
        // ignore — controlled input
    }

    const busy = stage.name !== 'idle' && stage.name !== 'confirmed' && stage.name !== 'error';
    const canPay = !busy && amountValid && recipientValid;

    const handlePay = async () => {
        setStage({ name: 'idle' });
        try {
            await oneClickGaslessPay(tonConnectUi, {
                master: USDT_MASTER,
                amount: amountUnits,
                destination: Address.parse(recipient),
                onStage: setStage
            });
        } catch (e) {
            setStage({ name: 'error', error: e instanceof Error ? e.message : String(e) });
        }
    };

    const reset = () => setStage({ name: 'idle' });

    const activeStep = activeStepIndex(stage);

    return (
        <div className="one-click-pay">
            <div className="one-click-pay__bg" aria-hidden />

            <main className="one-click-pay__card">
                <header className="one-click-pay__head">
                    <div className="one-click-pay__diamond" aria-hidden>
                        <svg viewBox="0 0 40 40" fill="none">
                            <path d="M20 36 L6 14 L14 6 H26 L34 14 Z" fill="url(#g1)" />
                            <defs>
                                <linearGradient id="g1" x1="0" y1="0" x2="40" y2="40">
                                    <stop offset="0" stopColor="#32B4FF" />
                                    <stop offset="1" stopColor="#0077D6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div>
                        <h1 className="one-click-pay__title">Pay with TON</h1>
                        <p className="one-click-pay__subtitle">
                            Gasless USDT transfer — relay fee paid in the same jetton, no TON needed
                            in the wallet.
                        </p>
                        {wallet && (
                            <span
                                className="one-click-pay__wallet-chip"
                                title={wallet.account.address}
                            >
                                {shortAddr(
                                    Address.parse(wallet.account.address).toString({
                                        bounceable: false
                                    })
                                )}
                            </span>
                        )}
                    </div>
                    {wallet && (
                        <button
                            type="button"
                            className="one-click-pay__disconnect"
                            onClick={() => tonConnectUi.disconnect()}
                            disabled={busy}
                        >
                            Disconnect
                        </button>
                    )}
                </header>

                <section className="one-click-pay__amount-row">
                    <label className="one-click-pay__label">
                        <span>Amount</span>
                        <div className="one-click-pay__amount-field">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={amountText}
                                onChange={e => setAmountText(e.target.value)}
                                disabled={busy}
                            />
                            <span className="one-click-pay__ticker">USDT</span>
                        </div>
                    </label>
                </section>

                <section className="one-click-pay__recipient-row">
                    <label className="one-click-pay__label">
                        <span>Recipient</span>
                        <input
                            type="text"
                            className="one-click-pay__recipient"
                            value={recipient}
                            onChange={e => setRecipient(e.target.value)}
                            disabled={busy}
                            placeholder="EQ... or UQ..."
                        />
                    </label>
                </section>

                <ul className="one-click-pay__steps" data-active={activeStep}>
                    {STEPS.map(s => {
                        const state =
                            activeStep > s.index
                                ? 'done'
                                : activeStep === s.index
                                  ? 'active'
                                  : 'idle';
                        return (
                            <li
                                key={s.key}
                                className={`one-click-pay__step one-click-pay__step--${state}`}
                            >
                                <span className="one-click-pay__step-dot" />
                                <span className="one-click-pay__step-label">{s.label}</span>
                            </li>
                        );
                    })}
                </ul>

                {stage.name === 'waiting-onchain' && (
                    <p className="one-click-pay__hint">
                        Waiting for the transfer to appear on-chain —{' '}
                        {Math.round(stage.pollsElapsedMs / 1000)}s elapsed
                    </p>
                )}
                {stage.name === 'submitting' && (
                    <p className="one-click-pay__hint">Submitting to the gasless relayer…</p>
                )}
                {stage.name === 'signing' && (
                    <p className="one-click-pay__hint">
                        Approve the signature request in your wallet.
                    </p>
                )}
                {stage.name === 'estimating' && (
                    <p className="one-click-pay__hint">Estimating relay fee…</p>
                )}

                {stage.name === 'confirmed' ? (
                    <div className="one-click-pay__result one-click-pay__result--ok">
                        <div className="one-click-pay__result-badge">✓</div>
                        <div>
                            <h2>Payment confirmed</h2>
                            <p>
                                Transferred <strong>{amountText} USDT</strong> to{' '}
                                <code>{shortAddr(stage.onchain.recipient)}</code>
                            </p>
                            <a
                                className="one-click-pay__explorer"
                                href={`https://tonviewer.com/transaction/${stage.onchain.eventId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on Tonviewer →
                            </a>
                        </div>
                    </div>
                ) : stage.name === 'error' ? (
                    <div className="one-click-pay__result one-click-pay__result--err">
                        <div className="one-click-pay__result-badge">!</div>
                        <div>
                            <h2>Something went wrong</h2>
                            <p>{stage.error}</p>
                        </div>
                    </div>
                ) : null}

                <button
                    className="one-click-pay__cta"
                    onClick={
                        stage.name === 'confirmed' || stage.name === 'error' ? reset : handlePay
                    }
                    disabled={stage.name === 'idle' ? !canPay : busy}
                >
                    {stage.name === 'confirmed'
                        ? 'Send another'
                        : stage.name === 'error'
                          ? 'Try again'
                          : busy
                            ? 'Processing…'
                            : wallet
                              ? 'Send'
                              : 'Connect + Send'}
                </button>

                <footer className="one-click-pay__foot">
                    Relay fee is deducted from the USDT amount by{' '}
                    <a
                        href="https://docs.tonconsole.com/tonapi/rest-api/gasless"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        TonAPI Gasless
                    </a>
                    . Wallet must support <code>SignMessage</code> —{' '}
                    <a
                        href="https://kit-demo-wallet-git-dev-timsdk-sign-message-updates-topteam.vercel.app/wallet"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        try the demo wallet ↗
                    </a>
                    .
                </footer>
            </main>
        </div>
    );
}
