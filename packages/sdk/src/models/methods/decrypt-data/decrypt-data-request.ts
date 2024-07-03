export interface DecryptData {
    senderAddress: string;
    data: string;
}

export interface DecryptDataRequest {
    // params: DecryptData[];
    data: string[];
    id: string;
}
