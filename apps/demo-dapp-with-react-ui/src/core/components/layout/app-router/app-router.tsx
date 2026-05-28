import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { PreserveSearchNavigate } from './preserve-search-navigate';
import { TonConnectSettingsSync } from '../../../../features/dev-settings/components/ton-connect-settings-sync/ton-connect-settings-sync';

import {
    BatchLimitsPage,
    CreateJettonPage,
    FindTxPage,
    IframeIframePage,
    IframePage,
    MerklePage,
    SettingsPage,
    SignDataPage,
    TonProofPage,
    SignMessagePage,
    TransferUsdtPage,
    TxFormPage,
    WidgetBuilderPage,
    WidgetSandboxPage
} from '../../../../pages/index';

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <TonConnectSettingsSync />
            <Routes>
                <Route path="/" element={<PreserveSearchNavigate to="/tx-form" replace />} />
                <Route path="/tx-form" element={<TxFormPage />} />
                <Route path="/sign-message" element={<SignMessagePage />} />
                <Route
                    path="/gasless"
                    element={<PreserveSearchNavigate to="/transfer-usdt" replace />}
                />
                <Route
                    path="/pay"
                    element={<PreserveSearchNavigate to="/transfer-usdt" replace />}
                />
                <Route path="/batch-limits" element={<BatchLimitsPage />} />
                <Route path="/transfer-usdt" element={<TransferUsdtPage />} />
                <Route path="/sign-data" element={<SignDataPage />} />
                <Route path="/ton-proof" element={<TonProofPage />} />
                <Route path="/find-tx" element={<FindTxPage />} />
                <Route path="/merkle" element={<MerklePage />} />
                <Route path="/create-jetton" element={<CreateJettonPage />} />
                <Route path="/widget-builder" element={<WidgetBuilderPage />} />
                <Route path="/widget-sandbox" element={<WidgetSandboxPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/iframe" element={<IframePage />} />
                <Route path="/iframe/iframe" element={<IframeIframePage />} />
                <Route path="*" element={<PreserveSearchNavigate to="/tx-form" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
