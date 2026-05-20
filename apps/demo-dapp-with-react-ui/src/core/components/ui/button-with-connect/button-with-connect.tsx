import type { FC } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

import { Button } from '@/core/components/ui/button';
import type { ButtonProps } from '@/core/components/ui/button';

export interface ButtonWithConnectProps extends ButtonProps {
    /**
     * If true, render the button as-is even when no wallet is connected. Use
     * when the action itself drives the connect flow (e.g. embedded-request),
     * so the user can dispatch a request before connecting.
     */
    skipConnectPrompt?: boolean;
}

/**
 * A submit-style button that flips to "Connect wallet" when there is no
 * connected wallet, opening the TonConnect modal on click. Once connected, it
 * renders the provided action label and forwards the original onClick.
 */
export const ButtonWithConnect: FC<ButtonWithConnectProps> = ({ skipConnectPrompt, ...props }) => {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();

    if (!wallet && !skipConnectPrompt) {
        return (
            <Button
                {...props}
                disabled={false}
                loading={false}
                onClick={() => tonConnectUI.openModal()}
            >
                Connect wallet
            </Button>
        );
    }

    return <Button {...props} />;
};
