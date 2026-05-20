import { useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import ReactJson from 'react-json-view';
import { Address } from '@ton/core';

import { Button } from '../../../core/components/ui/button/index';
import { Input } from '../../../core/components/ui/input/index';
import { ResultPanel } from '../../../core/components/result-panel/index';
import { sendItems } from '../lib/gasless-items';
import { sendMessages } from '../lib/gasless-messages';

const DEFAULT_DESTINATION = 'UQAHIrW23uWY7KOOYz6axu7WlBdA8iGwncI_Y8ZTWZA43yXF';

export function GaslessDemo() {
    const wallet = useTonWallet();
    const [tonConnectUi] = useTonConnectUI();

    const [destination, setDestination] = useState(DEFAULT_DESTINATION);
    const [jettonAmount, setJettonAmount] = useState('50000'); // 0.05 USDT in nano

    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result, setResult] = useState<any | null>(null);

    const resetState = () => {
        setStatus(null);
        setError(null);
        setResult(null);
    };

    const handleGaslessMessages = async () => {
        if (!wallet) {
            tonConnectUi.openModal();
            return;
        }

        resetState();
        try {
            const result = await sendMessages(
                tonConnectUi,
                BigInt(jettonAmount),
                Address.parse(destination)
            );
            setResult(result);
        } catch (error) {
            setStatus('Error sending gasless messages.');
            console.error(error);
            setError(String(error));
            setResult({ error: String(error) });
        }
    };

    const handleGaslessItems = async () => {
        resetState();
        try {
            const result = await sendItems(
                tonConnectUi,
                BigInt(jettonAmount),
                Address.parse(destination)
            );
            setResult(result);
        } catch (error) {
            console.error(error);
            setStatus('Error sending gasless items.');
            setError(String(error));
            setResult({ error: String(error) });
        }
    };

    return (
        <>
            <div className="flex flex-col gap-3">
                <Input size="s">
                    <Input.Header>
                        <Input.Title>Destination</Input.Title>
                    </Input.Header>
                    <Input.Field>
                        <Input.Input
                            value={destination}
                            onChange={e => setDestination(e.target.value)}
                            placeholder="Recipient address"
                        />
                    </Input.Field>
                </Input>
                <Input size="s">
                    <Input.Header>
                        <Input.Title>Amount (nano jettons)</Input.Title>
                    </Input.Header>
                    <Input.Field>
                        <Input.Input
                            value={jettonAmount}
                            onChange={e => setJettonAmount(e.target.value)}
                            placeholder="e.g. 1000000 = 1 USDT"
                        />
                    </Input.Field>
                </Input>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
                {wallet ? (
                    <>
                        <Button onClick={handleGaslessItems}>Sign gasless items</Button>
                        <Button onClick={handleGaslessMessages}>Send gasless messages</Button>
                    </>
                ) : (
                    <Button onClick={() => tonConnectUi.openModal()}>
                        Connect wallet to send gasless
                    </Button>
                )}
            </div>

            {status && <div className="text-sm text-foreground/70">{status}</div>}
            {error && <div className="text-sm text-error">Error: {error}</div>}

            {result && (
                <ResultPanel title="Result">
                    <ReactJson
                        src={result}
                        name={false}
                        theme="ocean"
                        collapsed={false}
                        style={{ borderRadius: 8, padding: 10, fontSize: 12 }}
                    />
                </ResultPanel>
            )}
        </>
    );
}
