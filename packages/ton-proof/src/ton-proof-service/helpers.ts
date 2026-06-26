import {
    Slice,
    StateInit,
    WalletContractV1R1,
    WalletContractV1R2,
    WalletContractV1R3,
    WalletContractV2R1,
    WalletContractV2R2,
    WalletContractV3R1,
    WalletContractV3R2,
    WalletContractV4 as WalletContractV4R2
} from '@ton/ton';
import { Buffer } from 'buffer';
import { WalletContractV4R1 } from './wrappers';
import { WalletOptions } from './interfaces';

export const DEFAULT_WALLETS: WalletOptions[] = [
    { contract: WalletContractV4R2, loadData: loadWalletV4Data },
    { contract: WalletContractV4R1, loadData: loadWalletV4Data },
    { contract: WalletContractV3R2, loadData: loadWalletV3Data },
    { contract: WalletContractV3R1, loadData: loadWalletV3Data },
    { contract: WalletContractV2R2, loadData: loadWalletV2Data },
    { contract: WalletContractV2R1, loadData: loadWalletV2Data },
    { contract: WalletContractV1R3, loadData: loadWalletV1Data },
    { contract: WalletContractV1R2, loadData: loadWalletV1Data },
    { contract: WalletContractV1R1, loadData: loadWalletV1Data }
];

function loadWalletV1Data(cs: Slice) {
    const seqno = cs.loadUint(32);
    const publicKey = cs.loadBuffer(32);
    return { seqno, publicKey };
}

function loadWalletV2Data(cs: Slice) {
    const seqno = cs.loadUint(32);
    const publicKey = cs.loadBuffer(32);
    return { seqno, publicKey };
}

function loadWalletV3Data(cs: Slice) {
    const seqno = cs.loadUint(32);
    const walletId = cs.loadUint(32);
    const publicKey = cs.loadBuffer(32);
    return { seqno, publicKey, walletId };
}

function loadWalletV4Data(cs: Slice) {
    const seqno = cs.loadUint(32);
    const walletId = cs.loadUint(32);
    const publicKey = cs.loadBuffer(32);
    const plugins = cs.loadMaybeRef();
    return { seqno, publicKey, walletId, plugins };
}

export function tryParsePublicKey(
    stateInit: StateInit,
    wallets: Required<WalletOptions>[]
): Buffer | null {
    if (!stateInit.code || !stateInit.data) {
        return null;
    }

    for (const { wallet, loadData } of wallets) {
        try {
            if (wallet.init.code.equals(stateInit.code)) {
                return loadData(stateInit.data.beginParse()).publicKey;
            }
        } catch (e) {}
    }

    return null;
}
