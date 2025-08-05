import './style.scss';
import { SendTransactionRequest, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { Address } from '@ton/ton';

// Component to test wallet batch message limits
export function WalletBatchLimitsTester() {
  const wallet = useTonWallet();
  const [tonConnectUi] = useTonConnectUI();

  // Generate transaction with specified number of messages
  const generateMultipleMessages = (count: number): SendTransactionRequest => {
    // The transaction is valid for 10 minutes
    const validUntil = Math.floor(Date.now() / 1000) + 600;
    
    // Get user's wallet address and convert to non-bounceable format
    let userAddress = '';
    if (wallet && wallet.account) {
      try {
        // Convert to Address object then to non-bounceable format
        const address = Address.parse(wallet.account.address);
        userAddress = address.toString({
          urlSafe: true,
          bounceable: false
        });
      } catch (e) {
        console.error('Error converting address:', e);
        userAddress = wallet.account.address;
      }
    }
    
    // Create array with 'count' messages
    const messages = Array(count).fill(null).map(() => ({
      // Send to user's own wallet address in non-bounceable format
      address: userAddress,
      // Small amount to send in nanoTON (0.00001 TON = 10000 nanoTON)
      amount: '10000',
    }));

    return {
      validUntil,
      messages,
    };
  };

  // Send transaction with specified number of messages
  const handleSendTransaction = (count: number) => {
    const tx = generateMultipleMessages(count);
    tonConnectUi.sendTransaction(tx);
  };

  return (
    <div className="wallet-batch-limits-tester">
      <h3>Batch Message Limits Test</h3>
      
      <div className="wallet-batch-limits-tester__info">
        Send multiple messages to the wallet to test message batching capabilities
      </div>
      
      {wallet ? (
        <div className="wallet-batch-limits-tester__buttons">
          <button 
            onClick={() => handleSendTransaction(4)}
          >
            Test with 4 Messages
          </button>
          <button 
            onClick={() => handleSendTransaction(255)}
          >
            Test with 255 Messages
          </button>
        </div>
      ) : (
        <div className="wallet-batch-limits-tester__error">
          Connect wallet to test batch limits
        </div>
      )}
    </div>
  );
} 