import { useState, useCallback, useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { evalFenceCondition } from '../../../../../../utils/jsonEval';
import type { TestResult } from '../../../../../../models';
import { compareResult } from '../../../../../../utils/compareResult';
import { getSecureRandomBytes } from '@ton/crypto';

export function useConnectValidation({
    testResult,
    setValidationErrors,
    showValidationModal,
    setShowStatusModal
}: {
    testResult: TestResult | undefined;
    setValidationErrors: (value: string[]) => void;
    showValidationModal: (isSuccess: boolean, errors?: string[]) => void;
    setShowStatusModal: (value: boolean) => void;
}) {
    const [tonConnectUI] = useTonConnectUI();

    useEffect(() => {
        const effect = async () => {
            const payload = await getSecureRandomBytes(32);
            tonConnectUI.setConnectRequestParameters({
                state: 'ready',
                value: { tonProof: payload.toString('hex') }
            });
        };

        effect();
    }, [tonConnectUI]);

    const wallet = useTonWallet();

    const [connectResult, setConnectResult] = useState<Record<string, unknown>>();
    const [isResultValid, setIsResultValid] = useState(true);

    useEffect(() => {
        setConnectResult(undefined);
        setIsResultValid(true);
        setValidationErrors([]);
        setShowStatusModal(false);
    }, [testResult?.id, setValidationErrors, setShowStatusModal]);

    const handleConnect = useCallback(async () => {
        if (!testResult) {
            setConnectResult({
                error: 'No precondition'
            });
            return;
        }

        // If wallet is already connected, don't proceed with connection test
        if (wallet) {
            setConnectResult({
                error: 'Wallet already connected. Please disconnect first to test connection flow.'
            });
            return;
        }

        const origDebug = console.debug.bind(console);
        const connectResponsePromise = new Promise<Record<string, unknown>>(resolve => {
            console.debug = (...args: unknown[]) => {
                if (
                    args.includes('Wallet message received:') ||
                    args.includes('Injected Provider connect response:')
                ) {
                    console.debug = origDebug; // Restore original debug after capturing
                    resolve(args[2] as Record<string, unknown>);
                }
                origDebug(...args);
            };
        });

        await tonConnectUI.openModal();
        try {
            setConnectResult(undefined);

            // TODO add abort!
            const connectResponse = await connectResponsePromise;
            setConnectResult(connectResponse);

            const parsedExpected = evalFenceCondition(testResult.expectedResult, {
                connectResponse: connectResponse,
                wallet
            });

            const [isResultValid, errors] = compareResult(connectResponse, parsedExpected);

            setIsResultValid(isResultValid);
            setValidationErrors(errors);

            if (!isResultValid && errors.length > 0) {
                showValidationModal(false, errors);
            } else if (isResultValid) {
                showValidationModal(true);
            }
        } catch (error) {
            // Handle connection error
            console.error('Connection error:', error);
        }
    }, [
        tonConnectUI,
        testResult,
        wallet,
        setValidationErrors,
        showValidationModal,
        setShowStatusModal
    ]);

    return {
        // State
        connectResult,
        isResultValid,
        wallet,

        // Actions
        handleConnect
    };
}
