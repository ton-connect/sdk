export interface SendTransactionRequest {
    /**
     * Sending transaction deadline in unix epoch seconds.
     */
    valid_until: number;

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
        initState?: string;

        /**
         * Contract specific data to add to the transaction.
         */
        payload?: string;
    }[];
}
