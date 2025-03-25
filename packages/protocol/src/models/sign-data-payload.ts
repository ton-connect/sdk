export type SignDataPayload = SignDataPayloadText | SignDataPayloadBinary | SignDataPayloadCell;

export type SignDataPayloadText = {
    type: 'text';
    text: string;
};
export type SignDataPayloadBinary = {
    type: 'binary';
    bytes: string;
};
export type SignDataPayloadCell = {
    type: 'cell';
    schema: string;
    cell: string;
};
