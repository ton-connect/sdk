import { useEffect, useState } from 'react';
import { useTonConnectUI, useTonWallet, CHAIN } from '@tonconnect/ui-react';
import { TonClient, JettonWallet } from '@ton/ton';
import { Address, beginCell, fromNano, toNano } from '@ton/core';
import { JettonMinter, storeJettonTransferMessage } from '@ton-community/assets-sdk';

import { Button } from '../../../core/components/ui/button/index';
import { Input } from '../../../core/components/ui/input/index';
import { Skeleton } from '../../../core/components/ui/skeleton/index';
import { retry } from '../../../server/utils/transactions-utils';
import { formatUnits, parseUnits } from '../../../core/utils/units';

const USDT_MASTER = Address.parse('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs');
const USDT_DECIMALS = 6;

const endpointByChain: Record<CHAIN, string> = {
    [CHAIN.MAINNET]: 'https://toncenter.com/api/v2/jsonRPC',
    [CHAIN.TESTNET]: 'https://testnet.toncenter.com/api/v2/jsonRPC'
};

export function TransferUsdt() {
    const wallet = useTonWallet();
    const senderAddress = wallet?.account.address;
    const [tonConnectUi] = useTonConnectUI();
    const [loading, setLoading] = useState(false);

    const [tonBalance, setTonBalance] = useState<string | null>(null);
    const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>('0.01');
    const [destination, setDestination] = useState<string | null>(null);
    const [jettonWallet, setJettonWallet] = useState<string | null>(null);

    useEffect(() => {
        if (senderAddress) {
            setDestination(
                Address.parse(senderAddress).toString({ urlSafe: true, bounceable: false })
            );
        } else {
            setDestination(null);
        }

        setTonBalance(null);
        setUsdtBalance(null);
        setJettonWallet(null);
    }, [senderAddress, setDestination, setTonBalance, setUsdtBalance, setJettonWallet]);

    useEffect(() => {
        if (!wallet || !senderAddress) return;
        if (![CHAIN.TESTNET, CHAIN.MAINNET].includes(wallet.account.chain as CHAIN)) return;

        const endpoint =
            wallet.account.chain === CHAIN.TESTNET
                ? endpointByChain[CHAIN.TESTNET]
                : endpointByChain[CHAIN.MAINNET];
        const client = new TonClient({ endpoint });
        const owner = Address.parse(senderAddress);
        const masterContract = client.open(JettonMinter.createFromAddress(USDT_MASTER));

        async function load() {
            const clientTonBalance = await retry(() => client.getBalance(owner), {
                retries: 10,
                delay: 1500
            });
            setTonBalance(fromNano(clientTonBalance));

            const jettonWalletAddr = await retry(() => masterContract.getWalletAddress(owner), {
                retries: 10,
                delay: 1500
            });
            const jettonWalletContract = client.open(JettonWallet.create(jettonWalletAddr));

            const balance = await retry(() => jettonWalletContract.getBalance(), {
                retries: 10,
                delay: 1500
            });
            setUsdtBalance(formatUnits(balance, USDT_DECIMALS));

            if (!jettonWallet) {
                setJettonWallet(jettonWalletAddr.toString({ urlSafe: true, bounceable: true }));
            }
        }

        setLoading(true);
        void load().finally(() => {
            setLoading(false);
        });
    }, [wallet, senderAddress, setDestination, setLoading]);

    const handleSend = async () => {
        if (!wallet) {
            tonConnectUi.openModal();
            return;
        }

        if (!destination || !senderAddress || !jettonWallet) {
            return;
        }

        const amountUSDT = parseUnits(amount, USDT_DECIMALS);

        if (!(amountUSDT > 0)) {
            return;
        }

        const body = beginCell()
            .store(
                storeJettonTransferMessage({
                    queryId: 0n,
                    amount: amountUSDT,
                    destination: Address.parse(destination),
                    responseDestination: Address.parse(senderAddress),
                    customPayload: null,
                    forwardAmount: toNano('0.001'),
                    forwardPayload: beginCell().storeUint(0, 32).storeStringTail('hello!').endCell()
                })
            )
            .endCell()
            .toBoc()
            .toString('base64');

        await tonConnectUi.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [
                {
                    address: jettonWallet,
                    amount: toNano('0.05').toString(),
                    payload: body
                }
            ]
        });
    };

    const balanceSkeleton = <Skeleton className="inline-block h-[18px] w-[80px]" />;

    return (
        <>
            <div className="flex flex-col gap-1 text-sm text-foreground">
                <div className="flex items-center gap-2">
                    <span className="text-secondary-foreground">USDT Balance:</span>
                    {loading ? balanceSkeleton : (usdtBalance ?? '—')}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-secondary-foreground">TON Balance:</span>
                    {tonBalance ?? balanceSkeleton}
                </div>
            </div>
            <div className="flex flex-col gap-3">
                <Input size="s">
                    <Input.Header>
                        <Input.Title>USDT Amount</Input.Title>
                    </Input.Header>
                    <Input.Field>
                        <Input.Input value={amount} onChange={e => setAmount(e.target.value)} />
                    </Input.Field>
                </Input>
                <Input size="s">
                    <Input.Header>
                        <Input.Title>Destination</Input.Title>
                    </Input.Header>
                    <Input.Field>
                        <Input.Input
                            value={destination ?? ''}
                            onChange={e => setDestination(e.target.value)}
                        />
                    </Input.Field>
                </Input>
                <div className="flex flex-col gap-1 text-sm text-foreground">
                    <span className="flex items-center gap-2 text-secondary-foreground">
                        Sender Jetton Wallet {loading && balanceSkeleton}
                    </span>
                    <a
                        className="break-all text-primary"
                        target="_blank"
                        href={`https://tonviewer.com/${jettonWallet}`}
                    >
                        {jettonWallet}
                    </a>
                </div>
            </div>

            {wallet ? (
                <Button onClick={handleSend} loading={loading}>
                    Send USDT
                </Button>
            ) : (
                <Button onClick={() => tonConnectUi.openModal()}>
                    Connect wallet to send USDT
                </Button>
            )}
        </>
    );
}
