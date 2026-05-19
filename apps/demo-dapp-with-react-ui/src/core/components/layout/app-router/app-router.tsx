import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { HomePage, IframeIframePage, IframePage, OneClickPayPage } from '@/pages';

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/pay" element={<OneClickPayPage />} />
                <Route path="/iframe" element={<IframePage />} />
                <Route path="/iframe/iframe" element={<IframeIframePage />} />
            </Routes>
        </BrowserRouter>
    );
};
