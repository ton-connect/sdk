import { CSSProperties, FunctionComponent, memo, useEffect } from 'react';
import { useTonConnectUI } from '../hooks/useTonConnectUI';

const buttonRootId = 'ton-connect-button';

export interface TonConnectButtonProps {
    className?: string;

    style?: CSSProperties;
}

/**
 * TonConnect Button is universal UI component for initializing connection. After wallet is connected it transforms to a wallet menu.
 * It is recommended to place it in the top right corner of your app.
 * @param [className] css class to add to the button container.
 * @param [style] style to add to the button container.
 * @constructor
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
