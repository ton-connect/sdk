
export interface SignDataRequest {
    /**
     * (integer): indicates the layout of payload cell that in turn defines domain separation.
     */
    schema_crc: number;
    /**
     *  (string, base64 encoded Cell): contains arbitrary data per its TL-B definition.
     */
    cell: string;

    /**
     * (HEX string without 0x, optional): The public key of key pair from which DApp intends to sign the data. If not set, the wallet is not limited in what keypair to sign. If publicKey parameter is set, the wallet SHOULD to sign by keypair corresponding this public key; If sign by this specified keypair is impossible, the wallet should show an alert and DO NOT ALLOW TO SIGN this data.
     */
    publicKey?: string;
}
