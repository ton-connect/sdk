import { ReactNode } from 'react';

interface RootProps {
    children: ReactNode;
}

function Root({ children }: RootProps) {
    return <div className="purchase-success">{children}</div>;
}

interface HeaderProps {
    title: string;
    subtitle?: string;
}

function Header({ title, subtitle }: HeaderProps) {
    return (
        <>
            <div className="purchase-success__icon" aria-hidden>
                <svg
                    className="purchase-success__check"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M5 12 L10 17 L19 7" />
                </svg>
            </div>
            <h1 className="purchase-success__title">{title}</h1>
            {subtitle ? <p className="purchase-success__subtitle">{subtitle}</p> : null}
        </>
    );
}

interface BlockProps {
    label: string;
    children: ReactNode;
}

function Block({ label, children }: BlockProps) {
    return (
        <div className="purchase-success__block">
            <span className="purchase-success__block-label">{label}</span>
            <div className="purchase-success__card">{children}</div>
        </div>
    );
}

interface ItemProps {
    thumbUrl: string;
    name: string;
    collection: string;
}

function Item({ thumbUrl, name, collection }: ItemProps) {
    return (
        <div className="purchase-success__item">
            <img className="purchase-success__item-thumb" src={thumbUrl} alt="" />
            <div>
                <div className="purchase-success__item-name">{name}</div>
                <div className="purchase-success__item-collection">{collection}</div>
            </div>
        </div>
    );
}

interface LineProps {
    label: string;
    amountIcon: ReactNode;
    amount: string;
    sub?: string;
}

function Line({ label, amountIcon, amount, sub }: LineProps) {
    return (
        <div className="purchase-success__line">
            <span className="purchase-success__line-label">{label}</span>
            <div className="purchase-success__line-value">
                <span className="purchase-success__line-amount">
                    <span className="purchase-success__line-amount-icon">{amountIcon}</span>
                    {amount}
                </span>
                {sub ? <span className="purchase-success__line-sub">{sub}</span> : null}
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

interface FooterProps {
    children: ReactNode;
}

function Footer({ children }: FooterProps) {
    return <div className="purchase-success__footer">{children}</div>;
}

interface CtaProps {
    onClick: () => void;
    children: ReactNode;
    variant?: 'primary' | 'secondary';
}

function Cta({ onClick, children, variant = 'primary' }: CtaProps) {
    return (
        <button
            type="button"
            className={`purchase-success__cta purchase-success__cta--${variant}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export const PurchaseSuccess = Object.assign(Root, {
    Header,
    Block,
    Item,
    Line,
    ExplorerLink,
    Footer,
    Cta
});
