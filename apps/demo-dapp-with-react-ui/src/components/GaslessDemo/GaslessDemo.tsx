import { useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import ReactJson from 'react-json-view';
import './style.scss';
import { sendItems } from './gaslessItems';
import { Address } from '@ton/core';
import { sendMessages } from './gaslessMessages';

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
        <div className="gasless-demo">
            <h3 id="gasless-usdt">Gasless USDT Transfer</h3>
            <p className="gasless-demo__subtitle">
                Transfer jettons without TON in wallet — fee is paid in the jetton itself.
            </p>

            <div className="gasless-demo__form">
                <label>
                    Destination
                    <input
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                        placeholder="Recipient address"
                    />
                </label>
                <label>
                    Amount (nano jettons)
                    <input
                        value={jettonAmount}
                        onChange={e => setJettonAmount(e.target.value)}
                        placeholder="e.g. 1000000 = 1 USDT"
                    />
                </label>
            </div>

            <div className="gasless-demo__buttons">
                {wallet ? (
                    <>
                        <button onClick={handleGaslessItems}>Sign gasless items</button>
                        <button onClick={handleGaslessMessages}>Send gasless messages</button>
                    </>
                ) : (
                    <button onClick={() => tonConnectUi.openModal()}>
                        Connect wallet to send gasless
                    </button>
                )}
            </div>

            {status && <div className="gasless-demo__status">{status}</div>}
            {error && <div className="gasless-demo__error">Error: {error}</div>}

            {result && (
                <div className="gasless-demo__debug">
                    <h4>Result</h4>
                    <ReactJson src={result} name={false} theme="ocean" collapsed={false} />
                </div>
            )}
        </div>
    );
}
