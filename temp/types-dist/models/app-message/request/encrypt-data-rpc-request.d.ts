export interface EncryptDataRpcRequest {
    method: 'encryptData';
    params: [
        {
            schema_crc: number;
            cell: string;
        }
    ];
    id: string;
}
