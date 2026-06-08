import { CSSProperties, FunctionComponent, memo, useEffect } from 'react';
import { useTonConnectUI } from '../hooks/useTonConnectUI';

const buttonRootId = 'ton-connect-button';

/** Props for {@link TonConnectButton}. */
export interface TonConnectButtonProps {
    /** Extra class name applied to the button container. */
    className?: string;

    /** Inline styles merged with the button container's `width: fit-content` default. */
    style?: CSSProperties;
}

/**
 * Universal "Connect Wallet" button.
 *
 * When connected, the button transforms into a wallet-account dropdown
 * (address, copy, disconnect). Style via `className` / `style` or via the
 * data-attribute selectors documented in `@tonconnect/ui`'s README.
 *
 * Must be rendered inside a <{@link TonConnectUIProvider}>.
 *
 * @example
 * ```tsx
 * <header>
 *     <span>My App</span>
 *     <TonConnectButton className="my-class" style={{ float: 'right' }} />
 * </header>
 * ```
 */
const TonConnectButton: FunctionComponent<TonConnectButtonProps> = ({ className, style }) => {
    const [_, setOptions] = useTonConnectUI();

    useEffect(() => {
        setOptions({ buttonRootId });
        return () => setOptions({ buttonRootId: null });
    }, [setOptions]);

    return (
        <div
            id={buttonRootId}
            className={className}
            style={{ width: 'fit-content', ...style }}
        ></div>
    );
};

export default memo(TonConnectButton);
