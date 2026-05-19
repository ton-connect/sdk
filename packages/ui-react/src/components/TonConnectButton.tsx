import { CSSProperties, FunctionComponent, memo, useEffect, useRef } from 'react';
import { useTonConnectUI } from '../hooks/useTonConnectUI';
import {
    addButtonId,
    removeButtonId,
    getButtonIds,
    DEFAULT_BUTTON_ID
} from '../utils/tonconnect-button-ids';

export interface TonConnectButtonProps {
    className?: string;
    style?: CSSProperties;

    id?: string;
}

/**
 * TonConnect Button is universal UI component for initializing connection. After wallet is connected it transforms to a wallet menu.
 * It is recommended to place it in the top right corner of your app.
 * @param [className] css class to add to the button container.
 * @param [style] style to add to the button container.
 * @constructor
 */
const TonConnectButton: FunctionComponent<TonConnectButtonProps> = ({ className, style, id }) => {
    const [_, setOptions] = useTonConnectUI();
    const buttonId = useRef<string>(
        id ??
            (getButtonIds().length === 0
                ? DEFAULT_BUTTON_ID
                : `ton-connect-button-${Math.random().toString(36).slice(2, 10)}`)
    );

    useEffect(() => {
        const newIds = addButtonId(buttonId.current);
        setOptions({ buttonRootId: newIds });

        return () => {
            const newIds = removeButtonId(buttonId.current);
            setOptions({ buttonRootId: newIds.length > 0 ? newIds : null });
        };
    }, [setOptions]);

    return (
        <div
            id={buttonId.current}
            className={className}
            style={{ width: 'fit-content', ...style }}
        ></div>
    );
};

export default memo(TonConnectButton);
