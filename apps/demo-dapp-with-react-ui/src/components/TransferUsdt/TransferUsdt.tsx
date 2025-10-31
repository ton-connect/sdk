import { useEffect, useState } from 'react';
import { useTonConnectUI, useTonWallet, CHAIN } from '@tonconnect/ui-react';
import { TonClient, JettonWallet } from '@ton/ton';
import { Address, beginCell, fromNano, toNano } from '@ton/core';
import { JettonMinter, storeJettonTransferMessage } from '@ton-community/assets-sdk';
import './style.scss';
import { retry } from '../../server/utils/transactions-utils';
import { formatUnits, parseUnits } from '../../utils/units';

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

    const loader = (
        <span
            className="loader"
            style={{
                display: 'inline-block',
                width: 18,
                height: 18,
                border: '3px solid #66aaee',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                verticalAlign: 'middle'
            }}
        ></span>
    );

    return (
        <div className="transfer-usdt">
            <h3>USDT Sending example</h3>
            <h4>USDT Balance: {loading ? loader : usdtBalance}</h4>
            <h4>TON Balance: {tonBalance}</h4>
            <div className="input-group">
                <label>
                    USDT Amount
                    <input value={amount} onChange={e => setAmount(e.target.value)} />
                </label>
                <label>
                    Destination
                    <input
                        value={destination ?? ''}
                        onChange={e => setDestination(e.target.value)}
                    />
                </label>
                <label>
                    <div>Sender Jetton Wallet {loading && loader}</div>
                    <a target="_blank" href={`https://tonviewer.com/${jettonWallet}`}>
                        {jettonWallet}
                    </a>
                </label>
            </div>

            {wallet ? (
                <button onClick={handleSend} disabled={loading}>
                    {loading ? 'Loading wallet info...' : 'Send USDT'}
                </button>
            ) : (
                <button onClick={() => tonConnectUi.openModal()}>
                    Connect wallet to send USDT
                </button>
            )}
        </div>
    );
}
