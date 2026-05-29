import './style.scss';
import { useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import {
    EmbeddedSignNoResponseError,
    oneClickGaslessPay,
    PayStage,
    USDT_MASTER
} from '../OneClickPay/oneClickGaslessFlow';
import { KISSED_FROG_6425, pickPreview } from './nftData';
import { NftLottie } from './NftLottie';

const PRICE_USDT_UNITS = 1_000_000n;
const PRICE_LABEL = '100';
const PRICE_USD = '$100';
const USDT_ICON =
    'https://i.getgems.io/B72rsV0ak6jDfESUi_x1Lniw7uP39c0Bw-qGguyuu6Q/rs:fill:150:150:1/g:ce/czM6Ly9nZXRnZW1zLXMzL2ltYWdlcy9qZXR0b24vVVNEVC80M2FhYzI2OGUzMjVmZjg2LnBuZw.webp';

const nft = KISSED_FROG_6425;
const NFT_IMAGE_LARGE = pickPreview(nft, 1500);
const NFT_IMAGE_THUMB = pickPreview(nft, 100);

function isBusy(stage: PayStage): boolean {
    return stage.name !== 'idle' && stage.name !== 'confirmed' && stage.name !== 'error';
}

function stageHint(stage: PayStage): string {
    switch (stage.name) {
        case 'estimating':
            return 'Estimating fee…';
        case 'signing':
            return 'Approve in wallet…';
        case 'submitting':
            return 'Submitting…';
        case 'waiting-onchain':
            return `On-chain · ${Math.round(stage.pollsElapsedMs / 1000)}s`;
        default:
            return '';
    }
}

function shortAddr(a: string): string {
    return a.length > 12 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a;
}

function VerifiedTick() {
    return (
        <svg viewBox="0 0 16 16" className="frog__verified" aria-hidden>
            <path
                d="M8 0l2.2 1.6L13 1.4l.6 2.7L16 5.6l-1.3 2.4L16 10.4l-2.4 1.5L13 14.6l-2.8-.2L8 16l-2.2-1.6L3 14.6l-.6-2.7L0 10.4l1.3-2.4L0 5.6l2.4-1.5L3 1.4l2.8.2L8 0z"
                fill="#0098EA"
            />
            <path
                d="M5 8l2 2 4-4"
                stroke="#fff"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function FrogDemo() {
    const [tonConnectUi] = useTonConnectUI();
    const wallet = useTonWallet();
    const [stage, setStage] = useState<PayStage>({ name: 'idle' });
    const [menuOpen, setMenuOpen] = useState(false);

    const busy = isBusy(stage);
    const success = stage.name === 'confirmed';

    const handleBuy = async () => {
        setStage({ name: 'idle' });

        if (!wallet) {
            try {
                await tonConnectUi.openModal();
            } catch {
                // user closed modal — leave idle
            }
            return;
        }

        try {
            const self = Address.parse(wallet.account.address);
            await oneClickGaslessPay(tonConnectUi, {
                master: USDT_MASTER,
                amount: PRICE_USDT_UNITS,
                destination: self,
                onStage: setStage
            });
        } catch (e) {
            if (e instanceof EmbeddedSignNoResponseError) {
                setStage({
                    name: 'error',
                    error: 'Wallet did not return a signed message. Check wallet history before retrying.'
                });
                return;
            }
            setStage({ name: 'error', error: e instanceof Error ? e.message : String(e) });
        }
    };

    const reset = () => setStage({ name: 'idle' });

    if (success) {
        return (
            <div className="frog">
                <div className="frog__success">
                    <div className="frog__success-icon">
                        <img src={NFT_IMAGE_THUMB} alt="" />
                    </div>
                    <h1 className="frog__success-title">1 / 1 actions completed</h1>
                    <p className="frog__success-sub">
                        <span className="frog__success-ok">1 success</span> · 0 errors
                    </p>
                    <p className="frog__success-note">
                        Closing this window will not undo any changes to the blockchain
                    </p>

                    <div className="frog__success-section">
                        <span className="frog__success-section-label">Buy</span>
                        <span className="frog__success-section-count">1</span>
                    </div>

                    <div className="frog__success-row">
                        <div className="frog__success-row-check">
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                                <circle cx="12" cy="12" r="12" fill="#2EBD59" />
                                <path
                                    d="M7 12.5l3 3 7-7"
                                    stroke="#fff"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        <img className="frog__success-row-img" src={NFT_IMAGE_THUMB} alt="" />
                        <div className="frog__success-row-text">
                            <div className="frog__success-row-name">{nft.name}</div>
                            <div className="frog__success-row-collection">
                                {nft.collection.name}
                            </div>
                        </div>
                        <div className="frog__success-row-price">
                            <img className="frog__price-icon" src={USDT_ICON} alt="USDT" />
                            <span>{PRICE_LABEL}</span>
                        </div>
                    </div>

                    <button className="frog__btn frog__btn--secondary" onClick={reset}>
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="frog">
            <header className="frog__topbar">
                <div className="frog__brand">
                    <div className="frog__logo" aria-hidden>
                        <svg viewBox="0 0 116 100" fill="currentColor">
                            <path d="M28.8674 0L49.487 0L59.7968 17.8571L49.487 35.7142H28.8674L18.5576 17.8571L28.8674 0Z" />
                            <path d="M86.6023 0L96.912 17.8571L86.6023 35.7142H65.9827L55.6729 17.8571L65.9827 0L86.6023 0Z" />
                            <path d="M115.47 49.9998L105.16 67.8569H84.5403L74.2305 49.9998L84.5403 32.1427L105.16 32.1428L115.47 49.9998Z" />
                            <path d="M86.6023 99.9997L65.9827 99.9997L55.6729 82.1426L65.9827 64.2855H86.6023L96.912 82.1426L86.6023 99.9997Z" />
                            <path d="M28.8674 99.9997L18.5576 82.1426L28.8674 64.2855H49.487L59.7968 82.1426L49.487 99.9997H28.8674Z" />
                            <path d="M0 49.9998L10.3098 32.1428H30.9294L41.2392 49.9998L30.9294 67.8569H10.3098L0 49.9998Z" />
                        </svg>
                    </div>
                    <div className="frog__brand-text">
                        <div className="frog__brand-name">NFT Marketplace</div>
                        <div className="frog__brand-sub">on TON</div>
                    </div>
                </div>
                <button
                    className="frog__menu-btn"
                    type="button"
                    aria-label="Open menu"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen(true)}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </header>

            {menuOpen && (
                <>
                    <div
                        className="frog__menu-backdrop"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden
                    />
                    <aside className="frog__menu" role="dialog" aria-label="Menu">
                        <div className="frog__menu-head">
                            <span className="frog__menu-title">Menu</span>
                            <button
                                type="button"
                                className="frog__menu-close"
                                aria-label="Close menu"
                                onClick={() => setMenuOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        {wallet ? (
                            <div className="frog__menu-wallet">
                                <div className="frog__menu-wallet-label">Connected</div>
                                <code className="frog__menu-wallet-addr">
                                    {shortAddr(
                                        Address.parse(wallet.account.address).toString({
                                            bounceable: false
                                        })
                                    )}
                                </code>
                                <button
                                    className="frog__btn frog__btn--secondary frog__menu-action"
                                    type="button"
                                    onClick={() => {
                                        tonConnectUi.disconnect();
                                        setMenuOpen(false);
                                    }}
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <button
                                className="frog__btn frog__btn--primary frog__menu-action"
                                type="button"
                                onClick={() => {
                                    setMenuOpen(false);
                                    handleBuy();
                                }}
                            >
                                Connect Wallet
                            </button>
                        )}
                    </aside>
                </>
            )}

            <div className="frog__image-card nft-image-wrap">
                <div className="nft-image-container">
                    {nft.lottie ? (
                        <NftLottie
                            lottieUrl={nft.lottie}
                            fallbackImage={NFT_IMAGE_LARGE}
                            alt={nft.name}
                        />
                    ) : (
                        <img
                            src={NFT_IMAGE_LARGE}
                            alt={nft.name}
                            className="nft-image-container__image"
                        />
                    )}
                </div>
            </div>

            <div className="frog__title-row">
                <h1 className="frog__title">{nft.name}</h1>
                <span className="frog__badge">For Sale</span>
            </div>

            <div className="frog__collection">
                <img className="frog__collection-icon" src={NFT_IMAGE_THUMB} alt="" />
                <span className="frog__collection-name">{nft.collection.name}</span>
                {nft.verified && <VerifiedTick />}
            </div>

            <div className="frog__price-block">
                <div className="frog__price-label">PRICE</div>
                <div className="frog__price-row">
                    <img className="frog__price-icon" src={USDT_ICON} alt="USDT" />
                    <span className="frog__price-value">{PRICE_LABEL}</span>
                    <span className="frog__price-usd">≈ {PRICE_USD}</span>
                </div>
            </div>

            {stage.name === 'error' && <div className="frog__error">{stage.error}</div>}

            <div className="frog__actions">
                <button
                    className="frog__btn frog__btn--primary"
                    onClick={handleBuy}
                    disabled={busy}
                >
                    <span className="frog__btn-plus" aria-hidden>
                        +
                    </span>
                    {busy ? stageHint(stage) : 'Buy Now'}
                </button>
            </div>
        </div>
    );
}
