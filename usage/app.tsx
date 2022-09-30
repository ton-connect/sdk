import { TonConnect, TransactionRequest, WidgetController } from 'src';

const connector = new TonConnect();
const widgetController = new WidgetController(connector);

export const App = () => {
    const [walletConnected, setWalletConnected] = useState(false);

    connector.onConnectedChange(setWalletConnected);

    const buttonRootRef = useRef();
    useLayoutEffect(() => {
        widgetController.button.render(buttonRootRef.current)
    })


    return (
        <>
            <header>
                <span>My cool app</span>
                <span ref={buttonRootRef}></span>
            </header>
            <main>
                {
                    walletConnected ?
                    <button onClick={() => widgetController.sendTransaction(generateRandomTx())}>Send random tx!</button> :
                    <button onClick={widgetController.connectWallet}>Connect Wallet to send tx</button>
                }
            </main>
        </>
    )
}

function generateRandomTx(): TransactionRequest {
    return {} as TransactionRequest;
}
