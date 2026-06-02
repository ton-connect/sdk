import './style.scss';
import { useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { KISSED_FROG_6425, pickPreview } from './nftData';
import { NftLottie } from './NftLottie';
import { MarketHeader } from '../../components/MarketHeader/MarketHeader';
import { sendMessages } from '../../components/GaslessDemo/gaslessMessages';
import { PurchaseSuccess } from './PurchaseSuccess';

const PRICE_USDT_UNITS = 1_000_000n;
const PRICE_LABEL = '100';
const PRICE_USD = '$100';
const USDT_ICON =
    'https://i.getgems.io/B72rsV0ak6jDfESUi_x1Lniw7uP39c0Bw-qGguyuu6Q/rs:fill:150:150:1/g:ce/czM6Ly9nZXRnZW1zLXMzL2ltYWdlcy9qZXR0b24vVVNEVC80M2FhYzI2OGUzMjVmZjg2LnBuZw.webp';
const TON_ICON = 'https://getgems.io/_next/static/media/ton.2d9f8065.png';

const nft = KISSED_FROG_6425;
const NFT_IMAGE_LARGE = pickPreview(nft, 1500);
const NFT_IMAGE_THUMB = pickPreview(nft, 100);

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Cosmetic stages for the purchase loader — each separated by a 500ms pause.
// No on-chain polling, no elapsed-seconds counter.
type Stage =
    | { name: 'idle' }
    | { name: 'estimating' }
    | { name: 'signing' }
    | { name: 'submitting' }
    | { name: 'confirmed' }
    | { name: 'error'; error: string };

const STAGE_LABEL: Partial<Record<Stage['name'], string>> = {
    estimating: 'Estimating fee…',
    signing: 'Sign in your wallet…',
    submitting: 'Submitting…'
};

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
    const [stage, setStage] = useState<Stage>({ name: 'idle' });

    const busy =
        stage.name === 'estimating' || stage.name === 'signing' || stage.name === 'submitting';
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

            setStage({ name: 'estimating' });
            await sleep(400);

            // Reuse the shared gasless transfer helper (same one the GaslessDemo uses):
            // estimate the relay fee, sign, and submit through the gasless relayer.
            setStage({ name: 'signing' });
            await sendMessages(tonConnectUi, PRICE_USDT_UNITS, self);

            setStage({ name: 'submitting' });
            await sleep(400);

            setStage({ name: 'confirmed' });
        } catch (e) {
            setStage({ name: 'error', error: e instanceof Error ? e.message : String(e) });
        }
    };

    const reset = () => setStage({ name: 'idle' });

    if (success) {
        return (
            <div className="frog">
                <PurchaseSuccess>
                    <PurchaseSuccess.Header
                        thumbUrl={NFT_IMAGE_LARGE}
                        title={nft.name}
                        subtitle="Joined your collection"
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
                            amountIcon={<img src={USDT_ICON} alt="USDT" />}
                            amount={`${PRICE_LABEL} USD₮`}
                            sub={`≈ ${PRICE_USD}`}
                        />
                        <PurchaseSuccess.Line
                            label="Fee"
                            amountIcon={<img src={TON_ICON} alt="TON" />}
                            amount="0 TON"
                            sub="paid by marketplace"
                        />
                    </PurchaseSuccess.Block>
                    <PurchaseSuccess.ExplorerLink
                        href={`https://tonviewer.com/transaction/${stage.name}`}
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
        <div className="frog">
            <MarketHeader />

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
                    {busy
                        ? (STAGE_LABEL[stage.name] ?? 'Processing…')
                        : `Buy for ${PRICE_LABEL} USD₮`}
                </button>
            </div>
        </div>
    );
}
