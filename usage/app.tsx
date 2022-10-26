import { SendTransactionRequest, TonConnectUi } from '@tonconnect/ui';

const tonConnect = new TonConnectUi();

export const App = () => {
    const [walletConnected, setWalletConnected] = useState(false);

    tonConnect.onStatusChange(walletInfo => setWalletConnected(!!walletInfo));

    const buttonRootRef = useRef();
    useLayoutEffect(() => {
        tonConnect.button.render(buttonRootRef.current)
    }, [])


    return (
        <>
            <header>
                <span>My cool app</span>
                <span ref={buttonRootRef}></span>
            </header>
            <main>
                {
                    walletConnected ?
                    <button onClick={() => tonConnect.sendTransaction(generateRandomTx())}>Send random tx!</button> :
                    <button onClick={tonConnect.connectWallet}>Connect Wallet to send tx</button>
                }
            </main>
        </>
    )
}

function generateRandomTx(): SendTransactionRequest {
    return {} as SendTransactionRequest;
}
