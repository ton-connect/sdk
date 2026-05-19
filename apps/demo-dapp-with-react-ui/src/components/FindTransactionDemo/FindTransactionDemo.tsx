import { useState } from 'react';
import ReactJson from 'react-json-view';
import { TonProofDemoApi } from '../../TonProofDemoApi';

const INPUT_CLS =
    'mb-2.5 w-full rounded-[12px] border border-[rgba(102,170,238,0.25)] bg-[rgba(30,40,60,0.7)] px-[14px] py-2.5 text-base text-white shadow-[0_1px_4px_0_rgba(16,22,31,0.08)] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#66aaee] focus:bg-[rgba(30,40,60,0.92)] focus:shadow-[0_0_0_2px_rgba(102,170,238,0.15)]';

const SELECT_CLS = `appearance-none bg-no-repeat bg-[length:18px_18px] bg-[position:right_12px_center] ${INPUT_CLS}`;

const LABEL_CLS =
    'mb-[6px] ml-[2px] mt-2.5 block text-[15px] font-medium tracking-[0.01em] text-[#b8d4f1]';

const CARET_BG =
    "url(\"data:image/svg+xml,%3Csvg width='16' height='16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%2366aaee' stroke-width='2' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E\")";

export const FindTransactionDemo = () => {
    const [boc, setBoc] = useState(
        'te6cckEBBQEA6wAB4YgB76ksIXpmobiUHDUtWosNdLgI+loKYwC+3DgXeRr2DJ4F4G+ja0rbyhi5yzD+xbfXI1owr5X3/uucREXZXZP4dqxPXukwqPGVrKzUL0g80tYaTgh95b0myTcmVFMS8cTIOU1NGLtDx7h4AAAQ8AAcAQJ7YgBFLU49uGmU3zOG8nNmcylqMjsoilVMAcYzYexnV5aM2BpiWgAAAAAAAAAAAAAAAAACMAAAAAEhlbGxvIYCBAEU/wD0pBP0vPLICwMASNMB0NMDAXGwkVvg+kAwcIAQyMsFWM8WIfoCy2oBzxbJgED7AAAAGE8sBQ=='
    );
    const [network, setNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
    const [txLoading, setTxLoading] = useState(false);
    const [txError, setTxError] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [txResult, setTxResult] = useState<any>(null);

    const handleFindTx = async () => {
        setTxLoading(true);
        setTxError(null);
        setTxResult(null);
        try {
            const transaction = await TonProofDemoApi.findTransactionByExternalMessage(
                boc,
                network
            );
            if (!transaction) {
                setTxError('Transaction not found');
            } else {
                setTxResult(transaction);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setTxError(err?.message || 'Unknown error');
        } finally {
            setTxLoading(false);
        }
    };

    return (
        <div className="mx-auto mt-[60px] flex w-full flex-col items-center gap-5 px-7 pb-6 pt-7">
            <h3 className="text-white/80">Find Transaction by External-in Message BOC</h3>
            <div className="flex w-full max-w-[600px] flex-col gap-4">
                <textarea
                    placeholder="Paste external-in message BOC (base64)"
                    value={boc}
                    onChange={e => setBoc(e.target.value)}
                    rows={3}
                    className="mb-3 min-h-[100px] w-full min-w-full max-w-full resize-y rounded-[14px] border-[1.5px] border-[rgba(102,170,238,0.25)] bg-[rgba(30,40,60,0.8)] px-[18px] py-[14px] font-mono text-sm text-white shadow-[0_2px_8px_0_rgba(16,22,31,0.10)] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#66aaee] focus:bg-[rgba(30,40,60,0.92)] focus:shadow-[0_0_0_2px_rgba(102,170,238,0.15)]"
                />
                <div className="mb-0 flex w-full gap-3">
                    <label htmlFor="network-select" className={LABEL_CLS}>
                        Network:
                    </label>
                    <select
                        id="network-select"
                        className={SELECT_CLS}
                        style={{ backgroundImage: CARET_BG }}
                        value={network}
                        onChange={e => setNetwork(e.target.value as 'mainnet' | 'testnet')}
                    >
                        <option value="mainnet">mainnet</option>
                        <option value="testnet">testnet</option>
                    </select>
                </div>
                <button className="demo-btn" onClick={handleFindTx} disabled={txLoading || !boc}>
                    {txLoading ? 'Searching...' : 'Find Transaction'}
                </button>
                {txError && <div className="text-red-500">{txError}</div>}
            </div>
            {txResult !== null && (
                <>
                    <div className="mb-[6px] ml-[2px] mt-[18px] self-start text-[15px] font-medium tracking-[0.01em] text-[#b8d4f1]">
                        Transaction
                    </div>
                    <ReactJson src={txResult} name={false} theme="ocean" collapsed={false} />
                </>
            )}
        </div>
    );
};
