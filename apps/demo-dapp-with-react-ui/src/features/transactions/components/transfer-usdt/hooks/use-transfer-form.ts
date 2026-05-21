import { useState } from 'react';

export type GaslessMode = 'messages' | 'items';

export const useTransferForm = () => {
    const [gasless, setGasless] = useState(false);
    const [gaslessMode, setGaslessMode] = useState<GaslessMode>('messages');

    return {
        gasless,
        setGasless,
        gaslessMode,
        setGaslessMode
    };
};
