import './style.scss';
import { TonConnectButton } from '@tonconnect/ui-react';

/**
 * Shared marketplace header used by the demo NFT pages (Frog / Cat). Logo +
 * "NFT Marketplace · on TON" on the left, a Connect/wallet button on the right.
 */
export function MarketHeader() {
    return (
        <header className="market-header">
            <div className="market-header__brand">
                <div className="market-header__logo" aria-hidden>
                    <svg viewBox="0 0 116 100" fill="currentColor">
                        <path d="M28.8674 0L49.487 0L59.7968 17.8571L49.487 35.7142H28.8674L18.5576 17.8571L28.8674 0Z" />
                        <path d="M86.6023 0L96.912 17.8571L86.6023 35.7142H65.9827L55.6729 17.8571L65.9827 0L86.6023 0Z" />
                        <path d="M115.47 49.9998L105.16 67.8569H84.5403L74.2305 49.9998L84.5403 32.1427L105.16 32.1428L115.47 49.9998Z" />
                        <path d="M86.6023 99.9997L65.9827 99.9997L55.6729 82.1426L65.9827 64.2855H86.6023L96.912 82.1426L86.6023 99.9997Z" />
                        <path d="M28.8674 99.9997L18.5576 82.1426L28.8674 64.2855H49.487L59.7968 82.1426L49.487 99.9997H28.8674Z" />
                        <path d="M0 49.9998L10.3098 32.1428H30.9294L41.2392 49.9998L30.9294 67.8569H10.3098L0 49.9998Z" />
                    </svg>
                </div>
                <div className="market-header__brand-text">
                    <div className="market-header__brand-name">NFT Marketplace</div>
                    <div className="market-header__brand-sub">on TON</div>
                </div>
            </div>

            <TonConnectButton />
        </header>
    );
}
