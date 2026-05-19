import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import {
    BatchLimitsPage,
    CreateJettonPage,
    FindTxPage,
    GaslessPage,
    IframeIframePage,
    IframePage,
    MerklePage,
    OneClickPayPage,
    SettingsPage,
    SignDataPage,
    TonProofPage,
    TransferUsdtPage,
    TxFormPage
} from '@/pages';

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/tx-form" replace />} />
                <Route path="/tx-form" element={<TxFormPage />} />
                <Route path="/gasless" element={<GaslessPage />} />
                <Route path="/batch-limits" element={<BatchLimitsPage />} />
                <Route path="/transfer-usdt" element={<TransferUsdtPage />} />
                <Route path="/sign-data" element={<SignDataPage />} />
                <Route path="/ton-proof" element={<TonProofPage />} />
                <Route path="/find-tx" element={<FindTxPage />} />
                <Route path="/merkle" element={<MerklePage />} />
                <Route path="/create-jetton" element={<CreateJettonPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/pay" element={<OneClickPayPage />} />
                <Route path="/iframe" element={<IframePage />} />
                <Route path="/iframe/iframe" element={<IframeIframePage />} />
                <Route path="*" element={<Navigate to="/tx-form" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
