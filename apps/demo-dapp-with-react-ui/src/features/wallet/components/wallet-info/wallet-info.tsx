import { useMemo } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { IdCard } from 'lucide-react';

import { Button } from '@/core/components/ui/button';
import { EmptyState } from '@/core/components/empty-state';
import { useTonBalance } from '@/core/hooks/use-ton-balance';

import { AddressesSection } from './components/addresses-section';
import { DeviceSection } from './components/device-section';
import { FeaturesSection } from './components/features-section';
import { NetworkSection } from './components/network-section';
import { buildAddressFormats } from './lib/address-formats';
import { normalizeFeatures } from './lib/feature-labels';

export const WalletInfo = () => {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const tonBalanceQuery = useTonBalance(wallet?.account.address);

    const addressFormats = useMemo(
        () => (wallet ? buildAddressFormats(wallet.account.address) : []),
        [wallet]
    );
    const features = useMemo(
        () => (wallet ? normalizeFeatures(wallet.device.features) : []),
        [wallet]
    );

    if (!wallet) {
        return (
            <EmptyState
                icon={IdCard}
                title="Connect a wallet"
                description="Connect a wallet to inspect its addresses, balance, and advertised features."
                action={
                    <Button
                        onClick={() => tonConnectUI.openModal()}
                        data-testid="wallet-info-connect-wallet-button"
                    >
                        Connect wallet
                    </Button>
                }
            />
        );
    }

    return (
        <div className="flex flex-col gap-6" data-testid="wallet-info">
            <DeviceSection
                appName={wallet.device.appName}
                appVersion={wallet.device.appVersion}
                platform={wallet.device.platform}
                maxProtocolVersion={wallet.device.maxProtocolVersion}
            />

            <NetworkSection
                chain={wallet.account.chain}
                tonBalance={tonBalanceQuery.data}
                isTonBalanceLoading={tonBalanceQuery.isLoading}
            />

            <AddressesSection formats={addressFormats} publicKey={wallet.account.publicKey} />

            <FeaturesSection features={features} />
        </div>
    );
};
