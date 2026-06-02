import { useEffect, useState } from 'react';

export type GaslessMode = 'messages' | 'items';

/** Gasless + embedded connect requires structured items (jetton wallet is resolved after connect). */
export const requiresGaslessItemsMode = (gasless: boolean, withConnect: boolean): boolean =>
    gasless && withConnect;

export const useTransferForm = () => {
    const [gasless, setGasless] = useState(false);
    const [gaslessMode, setGaslessMode] = useState<GaslessMode>('messages');
    const [withConnect, setWithConnect] = useState(false);

    useEffect(() => {
        if (requiresGaslessItemsMode(gasless, withConnect) && gaslessMode === 'messages') {
            setGaslessMode('items');
        }
    }, [gasless, withConnect, gaslessMode]);

    return {
        gasless,
        setGasless,
        gaslessMode,
        setGaslessMode,
        withConnect,
        setWithConnect
    };
};
