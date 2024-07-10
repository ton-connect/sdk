export interface EncryptDataRpcRequest {
    method: 'encryptData';
    // data: 
    //     string
    // ;
    params: string[];//publicKey, stringToEncrypt
    id: string;
}
