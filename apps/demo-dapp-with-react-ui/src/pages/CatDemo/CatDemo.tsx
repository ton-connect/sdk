import './style.scss';
import { useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { SCARED_CAT_742 } from './catData';
import { pickPreview } from '../FrogDemo/nftData';
import { NftLottie } from '../FrogDemo/NftLottie';
import { embeddedTonPay, PayStage, PRICE_TON, PRICE_TON_NANO } from './embeddedTonPay';

const nft = SCARED_CAT_742;
const NFT_IMAGE_LARGE = pickPreview(nft, 1500);
const NFT_IMAGE_THUMB = pickPreview(nft, 100);

const TON_ICON = 'https://getgems.io/_next/static/media/ton.2d9f8065.png';

function shortAddr(a: string): string {
    return a.length > 12 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a;
}

function TonIcon({ className }: { className?: string }) {
    return <img className={className} src={TON_ICON} alt="TON" />;
}

function VerifiedTick() {
    return (
        <svg viewBox="0 0 16 16" className="cat__verified" aria-hidden>
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

export function CatDemo() {
    const [tonConnectUi] = useTonConnectUI();
    const wallet = useTonWallet();
    const [stage, setStage] = useState<PayStage>({ name: 'idle' });

    const busy = stage.name === 'awaiting';
    const success = stage.name === 'confirmed';

    const handlePay = async () => {
        setStage({ name: 'idle' });
        try {
            await embeddedTonPay(tonConnectUi, {
                amountNano: PRICE_TON_NANO,
                onStage: setStage
            });
        } catch (e) {
            setStage({ name: 'error', error: e instanceof Error ? e.message : String(e) });
        }
    };

    const reset = () => setStage({ name: 'idle' });

    if (success && stage.name === 'confirmed') {
        return (
            <div className="cat">
                <div className="cat__success">
                    <div className="cat__success-icon">
                        <img src={NFT_IMAGE_THUMB} alt="" />
                    </div>
                    <h1 className="cat__success-title">Payment sent</h1>
                    <p className="cat__success-sub">
                        <span className="cat__success-ok">1 success</span> · 0 errors
                    </p>
                    <p className="cat__success-note">
                        Paid with TON in one tap — no wallet connection was needed beforehand.
                    </p>

                    <div className="cat__success-row">
                        <div className="cat__success-row-check">
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
                        <img className="cat__success-row-img" src={NFT_IMAGE_THUMB} alt="" />
                        <div className="cat__success-row-text">
                            <div className="cat__success-row-name">{nft.name}</div>
                            <div className="cat__success-row-collection">{nft.collection.name}</div>
                        </div>
                        <div className="cat__success-row-price">
                            <TonIcon className="cat__price-icon" />
                            <span>{PRICE_TON}</span>
                        </div>
                    </div>

                    <a
                        className="cat__explorer"
                        href={`https://tonviewer.com/transaction/${stage.boc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View transaction →
                    </a>
                    <button className="cat__btn cat__btn--secondary" onClick={reset}>
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cat">
            <header className="cat__topbar">
                <div className="cat__brand">
                    <div className="cat__logo" aria-hidden>
                        <svg viewBox="0 0 116 100" fill="currentColor">
                            <path d="M28.8674 0L49.487 0L59.7968 17.8571L49.487 35.7142H28.8674L18.5576 17.8571L28.8674 0Z" />
                            <path d="M86.6023 0L96.912 17.8571L86.6023 35.7142H65.9827L55.6729 17.8571L65.9827 0L86.6023 0Z" />
                            <path d="M115.47 49.9998L105.16 67.8569H84.5403L74.2305 49.9998L84.5403 32.1427L105.16 32.1428L115.47 49.9998Z" />
                            <path d="M86.6023 99.9997L65.9827 99.9997L55.6729 82.1426L65.9827 64.2855H86.6023L96.912 82.1426L86.6023 99.9997Z" />
                            <path d="M28.8674 99.9997L18.5576 82.1426L28.8674 64.2855H49.487L59.7968 82.1426L49.487 99.9997H28.8674Z" />
                            <path d="M0 49.9998L10.3098 32.1428H30.9294L41.2392 49.9998L30.9294 67.8569H10.3098L0 49.9998Z" />
                        </svg>
                    </div>
                    <div className="cat__brand-text">
                        <div className="cat__brand-name">NFT Marketplace</div>
                        <div className="cat__brand-sub">on TON</div>
                    </div>
                </div>

                <TonConnectButton />
            </header>

            <div className="cat__image-card nft-image-wrap">
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

            <div className="cat__title-row">
                <h1 className="cat__title">{nft.name}</h1>
                <span className="cat__badge">For Sale</span>
            </div>

            <div className="cat__collection">
                <img className="cat__collection-icon" src={NFT_IMAGE_THUMB} alt="" />
                <span className="cat__collection-name">{nft.collection.name}</span>
                {nft.verified && <VerifiedTick />}
            </div>

            <div className="cat__price-block">
                <div className="cat__price-label">PRICE</div>
                <div className="cat__price-row">
                    <TonIcon className="cat__price-icon" />
                    <span className="cat__price-value">{PRICE_TON}</span>
                    <span className="cat__price-ticker">TON</span>
                </div>
            </div>

            {stage.name === 'error' && <div className="cat__error">{stage.error}</div>}

            {stage.name === 'dispatched' && (
                <div className="cat__warn">
                    The wallet connected but didn&apos;t return a signed transaction. It may already
                    have been delivered inside the connect link — check your wallet history before
                    retrying to avoid a double payment.
                </div>
            )}

            <div className="cat__actions">
                <button className="cat__btn cat__btn--primary" onClick={handlePay} disabled={busy}>
                    <TonIcon className="cat__btn-diamond" />
                    {busy ? 'Confirm in your wallet…' : `Buy for ${PRICE_TON} TON`}
                </button>
            </div>
        </div>
    );
}
