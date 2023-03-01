import { CHAIN } from '@tonconnect/protocol';

export interface SendTransactionRequest {
    /**
     * Sending transaction deadline in unix epoch seconds.
     */
    validUntil: number;

    /**
     * The network (mainnet or testnet) where DApp intends to send the transaction. If not set, the transaction is sent to the network currently set in the wallet, but this is not safe and DApp should always strive to set the network. If the network parameter is set, but the wallet has a different network set, the wallet should show an alert and DO NOT ALLOW TO SEND this transaction.
     */
    network?: CHAIN;

    /**
     * The sender address in '<wc>:<hex>' format from which DApp intends to send the transaction. Current account.address by default.
     */
    from?: string;

    /**
     * Messages to send: min is 1, max is 4.
     */
    messages: {
        /**
         * Receiver's address.
         */
        address: string;

        /**
         * Amount to send in nanoTon.
         */
        amount: string;

        /**
         * Contract specific data to add to the transaction.
         */
        stateInit?: string;

        /**
         * Contract specific data to add to the transaction.
         */
        payload?: string;
    }[];
}
