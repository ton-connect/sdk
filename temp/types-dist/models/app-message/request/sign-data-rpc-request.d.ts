export interface SignDataRpcRequest {
    method: 'signData';
    params: [
        {
            schema_crc: number;
            cell: string;
        }
    ];
    id: string;
}
