import { useMemo } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';

import { useTonBalance } from '../../../../core/hooks/use-ton-balance';

import { AddressesSection } from './components/addresses-section';
import { DeviceSection } from './components/device-section';
import { FeaturesSection } from './components/features-section';
import { NetworkSection } from './components/network-section';
import { buildAddressFormats } from './utils/address-formats';
import { normalizeFeatures } from './utils/feature-labels';

export const WalletInfo = () => {
    const wallet = useTonWallet();
    const tonBalanceQuery = useTonBalance(wallet?.account.address);

    const addressFormats = useMemo(
        () => (wallet ? buildAddressFormats(wallet.account.address) : []),
        [wallet]
    );
    const features = useMemo(
        () => (wallet ? normalizeFeatures(wallet.device.features) : []),
        [wallet]
    );

    if (!wallet) return null;

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
