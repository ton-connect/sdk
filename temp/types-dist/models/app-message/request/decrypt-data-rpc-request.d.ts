export interface DecryptDataRpcRequest {
    method: 'decryptData';
    params: [
        {
            schema_crc: number;
            cell: string;
        }
    ];
    id: string;
}
