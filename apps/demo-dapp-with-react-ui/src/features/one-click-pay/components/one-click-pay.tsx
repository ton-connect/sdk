import { useMemo, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import {
    EmbeddedSignNoResponseError,
    oneClickGaslessPay,
    PayStage,
    USDT_MASTER
} from '../lib/one-click-gasless-flow';

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

// Inter + antialiased + cv ligatures (mirrors the .one-click-pay SCSS @ton-font mixin).
const TON_FONT_CLS =
    "font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] antialiased [font-feature-settings:'cv02','cv03','cv04','cv11']";

const HINT_CLS = 'mx-0 mb-[18px] mt-0 text-center text-[13px] text-[#6b7a8a]';

const STEP_DOT_BASE_CLS =
    'h-2.5 w-2.5 rounded-full transition-all duration-200 ease-in-out';

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
            if (e instanceof EmbeddedSignNoResponseError && e.dispatched) {
                setStage({
                    name: 'error',
                    error:
                        'Wallet connected but did not return a signed message. The request was ' +
                        'delivered inside the connect URL, so the wallet may have already ' +
                        'signed it. Check your wallet history (or the recipient address on ' +
                        'Tonviewer) before retrying — clicking Try again will sign a fresh ' +
                        'request and could result in a double payment.'
                });
                return;
            }
            setStage({ name: 'error', error: e instanceof Error ? e.message : String(e) });
        }
    };

    const reset = () => setStage({ name: 'idle' });

    const activeStep = activeStepIndex(stage);

    return (
        <div
            className={`relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-14 text-[#000814] max-[540px]:px-3.5 max-[540px]:py-6 ${TON_FONT_CLS}`}
        >
            {/* Soft TON-blue halos in the corners */}
            <div
                className="pointer-events-none absolute inset-0 z-0 bg-white"
                style={{
                    background:
                        'radial-gradient(600px 320px at 8% 0%, rgba(0, 152, 234, 0.10), transparent 70%), radial-gradient(500px 280px at 100% 100%, rgba(0, 152, 234, 0.08), transparent 70%), #ffffff'
                }}
                aria-hidden
            />

            <main className="relative z-[1] w-full max-w-[520px] rounded-[24px] border border-[#e4ebf2] bg-white p-10 shadow-[0_1px_2px_rgba(15,23,38,0.04),0_24px_48px_-16px_rgba(0,152,234,0.12)] max-[540px]:rounded-[20px] max-[540px]:px-5 max-[540px]:py-[26px]">
                <header className="mb-8 grid grid-cols-[auto_1fr_auto] items-center gap-4 max-[540px]:grid-cols-[auto_1fr] max-[540px]:gap-y-2.5">
                    <div
                        className="inline-flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#eaf4fc]"
                        aria-hidden
                    >
                        <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7">
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
                        <h1 className="m-0 text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-[#000814] max-[540px]:text-[22px]">
                            Pay with TON
                        </h1>
                        <p className="m-0 mt-1 text-sm leading-[1.5] text-[#6b7a8a]">
                            Gasless USDT transfer — relay fee paid in the same jetton, no TON needed
                            in the wallet.
                        </p>
                        {wallet && (
                            <span
                                className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-[#eaf4fc] px-3 py-1.5 text-xs font-medium text-[#0076b8] before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#0098ea] before:shadow-[0_0_0_3px_rgba(0,152,234,0.18)] before:content-['']"
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
                            className={`col-start-3 row-span-2 row-start-1 self-start rounded-full border border-[#e4ebf2] bg-transparent px-3.5 py-2 text-[13px] font-medium text-[#6b7a8a] transition-[color,border-color,background] duration-150 ease-in-out enabled:hover:border-[#9aa6b2] enabled:hover:bg-[#f5f8fb] enabled:hover:text-[#000814] disabled:cursor-not-allowed disabled:opacity-50 max-[540px]:col-span-full max-[540px]:row-auto max-[540px]:row-start-auto max-[540px]:justify-self-start ${TON_FONT_CLS}`}
                            onClick={() => tonConnectUi.disconnect()}
                            disabled={busy}
                        >
                            Disconnect
                        </button>
                    )}
                </header>

                <section>
                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6b7a8a]">
                            Amount
                        </span>
                        <div className="flex items-baseline gap-2.5 rounded-2xl border border-[#e4ebf2] bg-[#f5f8fb] px-[22px] py-[18px] transition-[border-color,box-shadow,background] duration-150 ease-in-out focus-within:border-[#0098ea] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(0,152,234,0.12)]">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={amountText}
                                onChange={e => setAmountText(e.target.value)}
                                disabled={busy}
                                className={`min-w-0 flex-1 border-none bg-transparent text-[36px] font-bold tracking-[-0.025em] text-[#000814] outline-none placeholder:text-[#9aa6b2] max-[540px]:text-[28px] ${TON_FONT_CLS}`}
                            />
                            <span className="text-base font-semibold text-[#6b7a8a]">USDT</span>
                        </div>
                    </label>
                </section>

                <section className="mb-7 mt-5">
                    <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6b7a8a]">
                            Recipient
                        </span>
                        <input
                            type="text"
                            className={`box-border w-full rounded-xl border border-[#e4ebf2] bg-[#f5f8fb] px-4 py-3.5 font-['JetBrains_Mono','SF_Mono',ui-monospace,'SFMono-Regular',Menlo,monospace] text-[13px] text-[#000814] outline-none transition-[border-color,box-shadow,background] duration-150 ease-in-out focus:border-[#0098ea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,152,234,0.12)] ${TON_FONT_CLS}`}
                            value={recipient}
                            onChange={e => setRecipient(e.target.value)}
                            disabled={busy}
                            placeholder="EQ... or UQ..."
                        />
                    </label>
                </section>

                <ul
                    className="m-0 mb-4 grid list-none grid-cols-4 gap-1 rounded-[14px] border border-[#e4ebf2] bg-[#f5f8fb] px-2 py-3.5 max-[540px]:text-[10px]"
                    data-active={activeStep}
                >
                    {STEPS.map(s => {
                        const isDone = activeStep > s.index;
                        const isActive = activeStep === s.index;
                        const textCls = isActive
                            ? 'text-[#000814]'
                            : isDone
                              ? 'text-[#1b2838]'
                              : 'text-[#9aa6b2]';
                        const dotCls = isActive
                            ? 'bg-[#0098ea] shadow-[0_0_0_4px_rgba(0,152,234,0.18)] animate-one-click-pay-pulse'
                            : isDone
                              ? 'bg-[#0098ea]'
                              : 'bg-[#d7dee6]';
                        return (
                            <li
                                key={s.key}
                                className={`flex flex-col items-center gap-2 text-center text-[11px] transition-colors duration-200 ease-in-out ${textCls}`}
                            >
                                <span className={`${STEP_DOT_BASE_CLS} ${dotCls}`} />
                                <span className="font-medium tracking-[0.01em]">{s.label}</span>
                            </li>
                        );
                    })}
                </ul>

                {stage.name === 'waiting-onchain' && (
                    <p className={HINT_CLS}>
                        Waiting for the transfer to appear on-chain —{' '}
                        {Math.round(stage.pollsElapsedMs / 1000)}s elapsed
                    </p>
                )}
                {stage.name === 'submitting' && (
                    <p className={HINT_CLS}>Submitting to the gasless relayer…</p>
                )}
                {stage.name === 'signing' && (
                    <p className={HINT_CLS}>Approve the signature request in your wallet.</p>
                )}
                {stage.name === 'estimating' && (
                    <p className={HINT_CLS}>Estimating relay fee…</p>
                )}

                {stage.name === 'confirmed' ? (
                    <div className="mb-5 grid grid-cols-[auto_1fr] items-start gap-3.5 rounded-2xl border border-[rgba(0,152,234,0.20)] bg-[#eaf4fc] px-5 py-[18px]">
                        <div className="inline-flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[#0098ea] text-sm font-bold text-white">
                            ✓
                        </div>
                        <div>
                            <h2 className="m-0 mb-1 text-[15px] font-bold tracking-[-0.01em] text-[#000814]">
                                Payment confirmed
                            </h2>
                            <p className="m-0 text-[13px] leading-[1.5] text-[#1b2838]">
                                Transferred <strong>{amountText} USDT</strong> to{' '}
                                <code className="rounded-md bg-[rgba(0,152,234,0.10)] px-1.5 py-px font-['JetBrains_Mono','SF_Mono',ui-monospace,monospace] text-xs text-[#0076b8]">
                                    {shortAddr(stage.onchain.recipient)}
                                </code>
                            </p>
                            <a
                                className="mt-2.5 inline-block text-[13px] font-semibold text-[#0098ea] no-underline hover:text-[#0086d1] hover:underline"
                                href={`https://tonviewer.com/transaction/${stage.onchain.eventId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on Tonviewer →
                            </a>
                        </div>
                    </div>
                ) : stage.name === 'error' ? (
                    <div className="mb-5 grid grid-cols-[auto_1fr] items-start gap-3.5 rounded-2xl border border-[#ffd4d4] bg-[#fff3f3] px-5 py-[18px]">
                        <div className="inline-flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[#e6424c] text-sm font-bold text-white">
                            !
                        </div>
                        <div>
                            <h2 className="m-0 mb-1 text-[15px] font-bold tracking-[-0.01em] text-[#b02029]">
                                Something went wrong
                            </h2>
                            <p className="m-0 break-words text-[13px] leading-[1.5] text-[#7a2a30]">
                                {stage.error}
                            </p>
                        </div>
                    </div>
                ) : null}

                <button
                    className={`block w-full cursor-pointer rounded-[14px] border-none bg-[#0098ea] px-6 py-4 text-base font-semibold tracking-[0.01em] text-white shadow-[0_6px_16px_rgba(0,152,234,0.28)] transition-[background,transform,box-shadow] duration-150 ease-in-out enabled:hover:-translate-y-px enabled:hover:bg-[#0086d1] enabled:hover:shadow-[0_10px_24px_rgba(0,152,234,0.32)] enabled:active:translate-y-0 enabled:active:bg-[#0076b8] enabled:active:shadow-[0_4px_10px_rgba(0,152,234,0.24)] disabled:cursor-not-allowed disabled:bg-[#c9d3dd] disabled:text-white disabled:shadow-none ${TON_FONT_CLS}`}
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

                <footer className="mt-[22px] text-center text-xs leading-[1.55] text-[#6b7a8a]">
                    Relay fee is deducted from the USDT amount by{' '}
                    <a
                        href="https://docs.tonconsole.com/tonapi/rest-api/gasless"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#0098ea] no-underline hover:text-[#0086d1] hover:underline"
                    >
                        TonAPI Gasless
                    </a>
                    . Wallet must support{' '}
                    <code className="rounded bg-[#f5f8fb] px-1.5 py-px font-['JetBrains_Mono','SF_Mono',ui-monospace,monospace] text-[11px] text-[#1b2838] [border:1px_solid_#e4ebf2]">
                        SignMessage
                    </code>{' '}
                    —{' '}
                    <a
                        href="https://kit-demo-wallet-git-dev-timsdk-sign-message-updates-topteam.vercel.app/wallet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#0098ea] no-underline hover:text-[#0086d1] hover:underline"
                    >
                        try the demo wallet ↗
                    </a>
                    .
                </footer>
            </main>
        </div>
    );
}
