import { ReactNode } from 'react';

interface RootProps {
    children: ReactNode;
}

function Root({ children }: RootProps) {
    return <div className="purchase-success">{children}</div>;
}

interface HeaderProps {
    thumbUrl: string;
    title: string;
    note: string;
    summary?: { success: number; errors: number };
    /** Tweaks the image scale inside the icon container (Cat used 72%, Frog 64%). */
    iconImageScale?: number;
}

function Header({
    thumbUrl,
    title,
    note,
    summary = { success: 1, errors: 0 },
    iconImageScale
}: HeaderProps) {
    const imgStyle = iconImageScale
        ? { width: `${iconImageScale}%`, height: `${iconImageScale}%` }
        : undefined;
    return (
        <>
            <div className="purchase-success__icon">
                <img src={thumbUrl} alt="" style={imgStyle} />
            </div>
            <h1 className="purchase-success__title">{title}</h1>
            <p className="purchase-success__sub">
                <span className="purchase-success__ok">
                    {summary.success} success
                </span>{' '}
                · {summary.errors} errors
            </p>
            <p className="purchase-success__note">{note}</p>
        </>
    );
}

interface SectionProps {
    label: string;
    count: number;
}

function Section({ label, count }: SectionProps) {
    return (
        <div className="purchase-success__section">
            <span className="purchase-success__section-label">{label}</span>
            <span className="purchase-success__section-count">{count}</span>
        </div>
    );
}

interface RowProps {
    thumbUrl: string;
    name: string;
    collection: string;
    priceIcon: ReactNode;
    priceLabel: string;
}

function Row({ thumbUrl, name, collection, priceIcon, priceLabel }: RowProps) {
    return (
        <div className="purchase-success__row">
            <div className="purchase-success__row-check">
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
            <img className="purchase-success__row-img" src={thumbUrl} alt="" />
            <div className="purchase-success__row-text">
                <div className="purchase-success__row-name">{name}</div>
                <div className="purchase-success__row-collection">{collection}</div>
            </div>
            <div className="purchase-success__row-price">
                <span className="purchase-success__row-price-icon">{priceIcon}</span>
                <span>{priceLabel}</span>
            </div>
        </div>
    );
}

interface ExplorerLinkProps {
    href: string;
    children: ReactNode;
}

function ExplorerLink({ href, children }: ExplorerLinkProps) {
    return (
        <a
            className="purchase-success__explorer"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
        >
            {children}
        </a>
    );
}

interface CtaProps {
    onClick: () => void;
    children: ReactNode;
}

function Cta({ onClick, children }: CtaProps) {
    return (
        <button
            type="button"
            className="purchase-success__cta"
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export const PurchaseSuccess = Object.assign(Root, {
    Header,
    Section,
    Row,
    ExplorerLink,
    Cta
});
