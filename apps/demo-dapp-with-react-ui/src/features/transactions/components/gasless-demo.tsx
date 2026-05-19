import { useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import ReactJson from 'react-json-view';
import { Address } from '@ton/core';

import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
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
        <div className="mt-[60px] flex flex-col items-center gap-4 p-5">
            <h3 id="gasless-usdt" className="m-0 text-foreground/80">
                Gasless USDT Transfer
            </h3>
            <p className="m-0 max-w-[600px] text-center text-[15px] text-foreground/60">
                Transfer jettons without TON in wallet — fee is paid in the jetton itself.
            </p>

            <div className="flex w-[500px] max-w-full flex-col gap-2.5">
                <Input>
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
                <Input>
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

            <div className="mt-2 flex flex-wrap justify-center gap-4">
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
                <div className="w-full max-w-[600px] text-left">
                    <h4 className="mb-2 text-[15px] text-foreground/90">Result</h4>
                    <ReactJson
                        src={result}
                        name={false}
                        theme="ocean"
                        collapsed={false}
                        style={{ borderRadius: 8, padding: 10, fontSize: 12 }}
                    />
                </div>
            )}
        </div>
    );
}
