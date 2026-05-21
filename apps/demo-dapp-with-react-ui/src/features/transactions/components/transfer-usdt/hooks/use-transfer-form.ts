import { useState } from 'react';

export type GaslessMode = 'messages' | 'items';

export const useTransferForm = () => {
    const [gasless, setGasless] = useState(false);
    const [gaslessMode, setGaslessMode] = useState<GaslessMode>('messages');
    const [withConnect, setWithConnect] = useState(false);

    return {
        gasless,
        setGasless,
        gaslessMode,
        setGaslessMode,
        withConnect,
        setWithConnect
    };
};
