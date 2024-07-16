import { CHAIN } from './constants';

export interface CheckProofRequestDto {
    address: string;
    network: CHAIN;
    public_key: string;
    proof: {
        timestamp: number;
        domain: {
            lengthBytes: number;
            value: string;
        };
        payload: string;
        signature: string;
        state_init: string;
    };
}
