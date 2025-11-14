export enum CHAIN {
    MAINNET = '-239',
    TESTNET = '-3'
}

// Extended chain ID type: enum values or any custom string
export type ChainId = CHAIN | string;
