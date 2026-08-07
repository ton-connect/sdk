import { Slice, Contract, StateInit, Cell } from '@ton/core';
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

export interface InitContract {
    readonly init: {
        data: Cell;
        code: Cell;
    };
}

interface ContractFactory {
    create(args: { workchain: number; publicKey: Buffer; walletId?: number | null }): InitContract;
}

export interface WalletOptions {
    contract: ContractFactory;
    loadData: (cs: Slice) => {
        publicKey: Buffer;
    };
    wallet?: InitContract;
}
