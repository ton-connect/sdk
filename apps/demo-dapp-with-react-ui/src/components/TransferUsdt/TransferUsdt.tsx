import { useEffect, useState } from 'react';
import { useTonConnectUI, useTonWallet, CHAIN } from '@tonconnect/ui-react';
import {
    TonClient,
    JettonWallet,
    internal,
    WalletContractV5R1,
    loadMessageRelaxed
} from '@ton/ton';
import {
    Address,
    beginCell,
    fromNano,
    storeMessage,
    storeMessageRelaxed,
    toNano,
    external,
    Cell
} from '@ton/core';
import { JettonMinter, storeJettonTransferMessage } from '@ton-community/assets-sdk';
import './style.scss';
import { retry } from '../../server/utils/transactions-utils';
import { formatUnits, parseUnits } from '../../utils/units';
import { TonApiClient } from '@ton-api/client';
import { ContractAdapter } from '@ton-api/ton-adapter';

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

    const handleSendGasless = async () => {
        const ta = new TonApiClient({
            baseUrl: 'https://tonapi.io'
        });
        const provider = new ContractAdapter(ta);

        const OP_CODES = {
            TK_RELAYER_FEE: 0x878da6e3,
            JETTON_TRANSFER: 0xf8a7ea5
        };

        const BASE_JETTON_SEND_AMOUNT = toNano(0.05);
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

        const workchain = 0;
        const walletV5 = WalletContractV5R1.create({
            workchain,
            publicKey: Buffer.from(wallet.account.publicKey!, 'hex')
        });
        const contract = provider.open(walletV5);

        const jettonWalletAddressResult = await ta.blockchain.execGetMethodForBlockchainAccount(
            USDT_MASTER,
            'get_wallet_address',
            {
                args: [walletV5.address.toRawString()]
            }
        );
        console.log('jettonWalletAddressResult', jettonWalletAddressResult);
        const jettonWalletUsdt = Address.parse(
            jettonWalletAddressResult.decoded.jetton_wallet_address
        );

        // we use USDt in this example,
        // so we just print all supported gas jettons and get the relay address.
        // we have to send excess to the relay address in order to make a transfer cheaper.
        const relayerAddress = await printConfigAndReturnRelayAddress();

        // Create payload for jetton transfer
        const tetherTransferPayload = beginCell()
            .storeUint(OP_CODES.JETTON_TRANSFER, 32)
            .storeUint(0, 64)
            .storeCoins(amountUSDT) // 1 USDT
            .storeAddress(Address.parse(destination)) // address for receiver
            .storeAddress(relayerAddress) // address for excesses
            .storeBit(false)
            .storeCoins(1n)
            .storeMaybeRef(undefined)
            .endCell();

        const messageToEstimate = beginCell()
            .storeWritable(
                storeMessageRelaxed(
                    internal({
                        to: jettonWalletUsdt,
                        bounce: true,
                        value: BASE_JETTON_SEND_AMOUNT,
                        body: tetherTransferPayload
                    })
                )
            )
            .endCell();

        const params = await ta.gasless.gaslessEstimate(USDT_MASTER, {
            walletAddress: walletV5.address,
            walletPublicKey: walletV5.publicKey.toString('hex'),
            messages: [{ boc: messageToEstimate }]
        });

        console.log('Estimated transfer:', params);

        const { boc: internalBoc } = await tonConnectUi.signMessage({
            validUntil: Math.ceil(Date.now() / 1000) + 5 * 60,
            messages: params.messages.map(message => ({
                address: message.address.toString(),
                amount: message.amount,
                stateInit: message.stateInit?.toBoc()?.toString('base64'),
                payload: message.payload?.toBoc()?.toString('base64')
            }))
        });

        // const tetherTransferForSend = walletV5.createTransfer({
        //     seqno,
        //     authType: 'internal',
        //     timeout: Math.ceil(Date.now() / 1000) + 5 * 60,
        //     secretKey: keyPair.secretKey,
        //     sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
        //     messages: params.messages.map(message =>
        //         internal({
        //             to: message.address,
        //             value: BigInt(message.amount),
        //             body: message.payload
        //         })
        //     )
        // });

        const internalMsg = Cell.fromBase64(internalBoc);

        const msg = loadMessageRelaxed(internalMsg.asSlice());

        const seqno = await contract.getSeqno();
        const extMessage = beginCell()
            .storeWritable(
                storeMessage(
                    external({
                        to: contract.address,
                        init: seqno === 0 ? contract.init : undefined,
                        body: msg.body
                    })
                )
            )
            .endCell();

        ta.gasless
            .gaslessSend({
                walletPublicKey: walletV5.publicKey.toString('hex'),
                boc: extMessage
            })
            .then(() => console.log('A gasless transfer sent!'))
            .catch(error => console.error(error.message));

        async function printConfigAndReturnRelayAddress(): Promise<Address> {
            const cfg = await ta.gasless.gaslessConfig();

            console.log('Available jettons for gasless transfer');
            console.log(cfg.gasJettons.map(gasJetton => gasJetton.masterId));

            console.log(`Relay address to send fees to: ${cfg.relayAddress}`);
            return cfg.relayAddress;
        }
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
                <>
                    <button onClick={handleSend} disabled={loading}>
                        {loading ? 'Loading wallet info...' : 'Send USDT'}
                    </button>
                    <button onClick={handleSendGasless} disabled={loading}>
                        {loading ? 'Loading wallet info...' : 'Send Gasless'}
                    </button>
                </>
            ) : (
                <button onClick={() => tonConnectUi.openModal()}>
                    Connect wallet to send USDT
                </button>
            )}
        </div>
    );
}
