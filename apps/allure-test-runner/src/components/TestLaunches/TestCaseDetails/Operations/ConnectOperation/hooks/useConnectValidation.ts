import { useState, useCallback, useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { evalFenceCondition } from '../../../../../../utils/jsonEval';
import type { TestResult } from '../../../../../../models';
import type { ConnectRequest } from '@tonconnect/protocol';
import { compareResult } from '../../../../../../utils/compareResult';

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

        let connectRequest: ConnectRequest | undefined = undefined;
        let connectResponse: Record<string, unknown> | undefined = undefined;
        const origDebug = console.debug.bind(console);
        console.debug = (...args: unknown[]) => {
            if (args.includes('Send http-bridge request:')) {
                connectRequest = args[2] as ConnectRequest;
            }
            if (args.includes('Wallet message received:')) {
                connectResponse = args[2] as Record<string, unknown>;
                console.debug = origDebug; // Restore original debug after capturing
            }
            origDebug(...args);
        };

        try {
            setConnectResult(undefined);

            // Connect to wallet
            await tonConnectUI.connectWallet();

            // Wait a bit for the wallet message to be received
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            // Handle connection error
            console.error('Connection error:', error);
        } finally {
            // Restore original console.debug
            console.debug = origDebug;

            setConnectResult(connectResponse);

            if (connectResponse) {
                const parsedExpected = evalFenceCondition(testResult.expectedResult, {
                    connectRequest: connectRequest,
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
            } else {
                setIsResultValid(false);
                setValidationErrors(['No wallet response received']);
                showValidationModal(false, ['No wallet response received']);
            }
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
