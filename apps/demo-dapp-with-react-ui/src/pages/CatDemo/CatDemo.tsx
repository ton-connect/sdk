import './style.scss';
import { useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { SCARED_CAT_742 } from './catData';
import { pickPreview } from '../FrogDemo/nftData';
import { NftLottie } from '../FrogDemo/NftLottie';
import { MarketHeader } from '../../components/MarketHeader/MarketHeader';
import { embeddedTonPay, PRICE_TON, PRICE_TON_NANO } from './embeddedTonPay';
import { PurchaseSuccess } from '../FrogDemo/PurchaseSuccess';

const nft = SCARED_CAT_742;
const NFT_IMAGE_LARGE = pickPreview(nft, 1500);
const NFT_IMAGE_THUMB = pickPreview(nft, 100);

const TON_ICON = 'https://getgems.io/_next/static/media/ton.2d9f8065.png';

// Cosmetic stages for the purchase loader — each separated by a 400ms pause.
// No on-chain polling, no elapsed-seconds counter.
type Stage =
    | { name: 'idle' }
    | { name: 'estimating' }
    | { name: 'signing' }
    | { name: 'submitting' }
    | { name: 'confirmed'; boc: string | null }
    | { name: 'dispatched' }
    | { name: 'error'; error: string };

const STAGE_LABEL: Partial<Record<Stage['name'], string>> = {
    estimating: 'Estimating fee…',
    signing: 'Sign in your wallet…',
    submitting: 'Submitting…'
};

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
    const [stage, setStage] = useState<Stage>({ name: 'idle' });

    const busy =
        stage.name === 'estimating' || stage.name === 'signing' || stage.name === 'submitting';
    const success = stage.name === 'confirmed';

    const handlePay = async () => {
        setStage({ name: 'idle' });
        try {
            // One-tap embedded request: connect + sign + send in a single round-trip.
            setStage({ name: 'signing' });
            const res = await embeddedTonPay(tonConnectUi, PRICE_TON_NANO);

            if (res.dispatched) {
                setStage({ name: 'dispatched' });
                return;
            }

            setStage({ name: 'confirmed', boc: res.boc });
        } catch (e) {
            setStage({ name: 'error', error: e instanceof Error ? e.message : String(e) });
        }
    };

    const reset = () => setStage({ name: 'idle' });

    if (success && stage.name === 'confirmed') {
        return (
            <div className="cat">
                <MarketHeader />

                <PurchaseSuccess>
                    <PurchaseSuccess.Header
                        title="Success"
                        subtitle="New NFT joined your collection"
                    />
                    <PurchaseSuccess.Block label="Purchased">
                        <PurchaseSuccess.Item
                            thumbUrl={NFT_IMAGE_THUMB}
                            name={nft.name}
                            collection={nft.collection.name}
                        />
                    </PurchaseSuccess.Block>
                    <PurchaseSuccess.Block label="Spent">
                        <PurchaseSuccess.Line
                            label="Price"
                            amountIcon={<TonIcon />}
                            amount={`${PRICE_TON} TON`}
                            sub="≈ $194.32"
                        />
                        <PurchaseSuccess.Line
                            label="Fee"
                            amountIcon={<TonIcon />}
                            amount="0.1 TON"
                            sub="≈ $0.19"
                        />
                    </PurchaseSuccess.Block>
                    <PurchaseSuccess.ExplorerLink
                        href={`https://tonviewer.com/transaction/${stage.boc}`}
                    >
                        View transaction →
                    </PurchaseSuccess.ExplorerLink>
                    <PurchaseSuccess.Footer>
                        <PurchaseSuccess.Cta variant="primary" onClick={reset}>
                            Continue shopping
                        </PurchaseSuccess.Cta>
                        <PurchaseSuccess.Cta variant="secondary" onClick={reset}>
                            Close
                        </PurchaseSuccess.Cta>
                    </PurchaseSuccess.Footer>
                </PurchaseSuccess>
            </div>
        );
    }

    return (
        <div className="cat">
            <MarketHeader />

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
                    <span className="cat__price-ticker">≈ $195.32</span>
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
                    {busy ? (STAGE_LABEL[stage.name] ?? 'Processing…') : `Buy for ${PRICE_TON} TON`}
                </button>
            </div>
        </div>
    );
}
