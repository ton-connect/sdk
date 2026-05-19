import { useState } from 'react';
import ReactJson from 'react-json-view';

import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Select } from '@/core/components/ui/select';
import { ChevronDownIcon } from '@/core/components/ui/icons';
import { TonProofDemoApi } from '@/core/lib/ton-proof-demo-api';

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
            <h3 className="text-foreground/80">Find Transaction by External-in Message BOC</h3>
            <div className="flex w-full max-w-[600px] flex-col gap-4">
                <Input>
                    <Input.Header>
                        <Input.Title>External-in message BOC</Input.Title>
                    </Input.Header>
                    <Input.Field>
                        <Input.Input
                            type="text"
                            placeholder="Paste base64 BOC"
                            value={boc}
                            onChange={e => setBoc(e.target.value)}
                        />
                    </Input.Field>
                </Input>
                <div className="flex w-full items-center gap-3">
                    <span className="text-sm font-medium text-secondary-foreground">Network:</span>
                    <Select.Root
                        value={network}
                        onValueChange={v => setNetwork(v as 'mainnet' | 'testnet')}
                    >
                        <Select.Trigger variant="gray" size="m" borderRadius="l">
                            {network}
                            <ChevronDownIcon size={16} />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value="mainnet">mainnet</Select.Item>
                            <Select.Item value="testnet">testnet</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </div>
                <Button onClick={handleFindTx} disabled={txLoading || !boc}>
                    {txLoading ? 'Searching...' : 'Find Transaction'}
                </Button>
                {txError && <div className="text-error">{txError}</div>}
            </div>
            {txResult !== null && (
                <>
                    <div className="mb-[6px] ml-[2px] mt-[18px] self-start text-[15px] font-medium tracking-[0.01em] text-secondary-foreground">
                        Transaction
                    </div>
                    <ReactJson src={txResult} name={false} theme="ocean" collapsed={false} />
                </>
            )}
        </div>
    );
};
