export interface DecryptDataRpcRequest {
    method: 'decryptData';
    // params: [
    //     senderAddress: string,
    //     data: string,
    // ];
    params: string[];//senderAddress, stringToDecrypt
    id: string;
    //TODO: currently senderAddress is the first parameter in the array, but it shall be passed separately, with array holding the many entries
    // senderAddress: string;
}

//TODO: change to just array in interface with string hex