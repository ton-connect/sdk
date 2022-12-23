import { CSSProperties, FunctionComponent, memo, useEffect } from 'react';
import { useTonConnectUI } from '../hooks/useTonConnectUI';

const buttonRootId = 'ton-connect-button';

export interface TonConnectButtonProps {
    className?: string;
    style?: CSSProperties;
}
const TonConnectButton: FunctionComponent<TonConnectButtonProps> = ({ className, style }) => {
    const [_, setOptions] = useTonConnectUI();

    useEffect(() => {
        setOptions({ buttonRootId });
    }, []);

    return <div id={buttonRootId} className={className} style={style}></div>;
};

export default memo(TonConnectButton);
