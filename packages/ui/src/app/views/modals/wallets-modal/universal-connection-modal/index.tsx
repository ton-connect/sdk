import { Component, createSignal, Match, Switch } from 'solid-js';
import { TabBarStyled, TabTextStyled, UniversalConnectionModalStyled } from './style';
import { DesktopSelectWalletModal } from './desktop-select-wallet-modal';
import { UniversalQrModal } from './universal-qr-modal';

interface UniversalConnectionModalProps {}

export const UniversalConnectionModal: Component<UniversalConnectionModalProps> = props => {
    const [selectedTabIndex, setSelectedTabIndex] = createSignal(0);

    //const connectionSource = appState.connector.connect();
    const connectionSource =
        'https://app.tonkeeper.com/ton-connect?v=2&id=3edf488fda8cdeceaddf7dba24fc075e455cd4a64139344efff4063b62660266&r=%7B%22manifestUrl%22%3A%22https%3A%2F%2Fton-connect.github.io%2Fdemo-dapp%2Ftonconnect-manifest.json%22%2C%22items%22%3A%5B%7B%22name%22%3A%22ton_addr%22%7D%5D%7D&ret=none';

    return (
        <UniversalConnectionModalStyled>
            <TabBarStyled
                tab1={<TabTextStyled>QR Code</TabTextStyled>}
                tab2={<TabTextStyled>Wallets</TabTextStyled>}
                selectedTabIndex={selectedTabIndex()}
                onSelectedTabIndexChange={setSelectedTabIndex}
            />

            <Switch>
                <Match when={selectedTabIndex() === 0}>
                    <UniversalQrModal />
                </Match>
                <Match when={selectedTabIndex() === 1}>
                    <DesktopSelectWalletModal />
                </Match>
            </Switch>
        </UniversalConnectionModalStyled>
    );
};
