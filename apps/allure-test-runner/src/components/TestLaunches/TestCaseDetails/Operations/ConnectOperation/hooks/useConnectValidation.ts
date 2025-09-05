import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { evalFenceCondition } from '../../../../../../utils/jsonEval';
import type { TestResult } from '../../../../../../models';
import { compareResult } from '../../../../../../utils/compareResult';
import { getSecureRandomBytes } from '@ton/crypto';
import type { ConnectEvent } from '@tonconnect/protocol';
import { changeManifestUrl } from '../../../../../../utils/manifest';
import { manifestUrl } from '../../../../../../providers/TonConnectProvider';

type ConnectPrecondition = {
    __meta?: {
        manifestUrl?: string;
        excludeTonProof?: boolean;
    };
};

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
    const tonProofRef = useRef<string>(undefined);

    const parsedPrecondition = useMemo(
        () => testResult && evalFenceCondition<ConnectPrecondition>(testResult.precondition),
        [testResult]
    );

    useEffect(() => {
        if (parsedPrecondition?.__meta?.excludeTonProof) {
            tonProofRef.current = undefined;
            tonConnectUI.setConnectRequestParameters({
                state: 'ready',
                value: { tonProof: undefined }
            });
            return;
        }

        const effect = async () => {
            const payload = await getSecureRandomBytes(32);
            const tonProof = payload.toString('hex');
            tonProofRef.current = tonProof;
            tonConnectUI.setConnectRequestParameters({
                state: 'ready',
                value: { tonProof }
            });
        };

        void effect();
    }, [tonConnectUI, parsedPrecondition]);

    const wallet = useTonWallet();

    const [connectResult, setConnectResult] = useState<Record<string, unknown>>();
    const [isResultValid, setIsResultValid] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const abortControllerRef = useRef<AbortController>(null);

    useEffect(() => {
        setConnectResult(undefined);
        setIsResultValid(true);
        setValidationErrors([]);
        setShowStatusModal(false);
        setIsConnecting(false);
    }, [testResult?.id, setValidationErrors, setShowStatusModal]);

    const handleConnect = useCallback(async () => {
        if (!testResult) {
            setConnectResult({
                error: 'No precondition'
            });
            return;
        }

        if (wallet) {
            setConnectResult({
                error: 'Wallet already connected. Please disconnect first to test connection flow.'
            });
            return;
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsConnecting(true);

        const origDebug = console.debug.bind(console);
        const connectResponsePromise = new Promise<ConnectEvent>((resolve, reject) => {
            if (controller.signal.aborted) {
                reject(new Error('Connection aborted'));
                return;
            }

            console.debug = (...args: unknown[]) => {
                if (
                    args.includes('Wallet message received:') ||
                    args.includes('Injected Provider connect response:')
                ) {
                    console.debug = origDebug;
                    resolve(args[2] as ConnectEvent);
                }
                origDebug(...args);
            };

            controller.signal.addEventListener('abort', () => {
                reject(new Error('Connection aborted'));
            });
        });

        const meta = parsedPrecondition?.__meta;

        if (meta?.manifestUrl) {
            changeManifestUrl(tonConnectUI, meta.manifestUrl);
        }

        await tonConnectUI.openModal();

        try {
            setConnectResult(undefined);

            const connectResponse = await connectResponsePromise;
            setConnectResult(connectResponse as unknown as Record<string, unknown>);

            const parsedExpected = evalFenceCondition(testResult.expectedResult, {
                connectResponse,
                wallet,
                tonProof: tonProofRef.current
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
            console.error('Connection error:', error);
            if (error instanceof Error && error.message === 'Connection aborted') {
                setConnectResult({
                    error: 'Connection was aborted by user'
                });
            } else {
                setConnectResult({
                    error: 'Connection failed'
                });
            }
        } finally {
            if (meta?.manifestUrl) {
                changeManifestUrl(tonConnectUI, manifestUrl);
            }
            setIsConnecting(false);
            console.debug = origDebug;
        }
    }, [
        tonConnectUI,
        testResult,
        wallet,
        setValidationErrors,
        showValidationModal,
        setShowStatusModal
    ]);

    const handleAbort = () => abortControllerRef.current?.abort();

    return {
        // State
        connectResult,
        isResultValid,
        isConnecting,
        wallet,

        // Actions
        handleConnect,
        handleAbort
    };
}
