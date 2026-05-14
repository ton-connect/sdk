import { CSSProperties, FunctionComponent, memo, useEffect } from 'react';
import { useTonConnectUI } from '../hooks/useTonConnectUI';

const buttonRootId = 'ton-connect-button';

export interface TonConnectButtonProps {
    /**
     * CSS class to add to the button container.
     */
    className?: string;

    /**
     * Inline style to add to the button container.
     */
    style?: CSSProperties;
}

const TonConnectButtonComponent: FunctionComponent<TonConnectButtonProps> = ({
    className,
    style
}) => {
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

/**
 * TonConnect Button is a universal UI component for initializing connection.
 * After a wallet connects, it transforms into a wallet menu. Place it in the
 * top right corner of your app. Props on {@link TonConnectButtonProps}.
 */
const TonConnectButton = memo(TonConnectButtonComponent);

export default TonConnectButton;
