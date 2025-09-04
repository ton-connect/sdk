import type { EvalContext } from './context';
import {
    buildSuccessMerkleProof,
    buildSuccessMerkleUpdate,
    buildVerifyMerkleProof,
    buildVerifyMerkleUpdate,
    Exotic,
    EXOTIC_CODE
} from '../../contracts/exotic';
import { Address, beginCell, storeStateInit, toNano } from '@ton/ton';
import { createJettonMaster, mintMessage } from '../../contracts/jetton';
import { CHAIN } from '@tonconnect/sdk';
import { determineWalletVersion } from '../../contracts/wallet';

export function nowPlusMinutes(minutes: number): number {
    return Math.floor(Date.now() / 1000) + minutes * 60;
}

export function nowPlus5Minutes() {
    return nowPlusMinutes(5);
}

export function nowMinus5Minutes() {
    return nowPlusMinutes(-5);
}

export function verifyMerkleProofMessage(this: EvalContext) {
    if (!this?.wallet?.account.address) {
        console.error('Invalid context for verifyMerkleProofMessage provided');
        return undefined;
    }
    const sender = this.wallet.account.address;

    const exotic = Exotic.createFromConfig(
        {
            owner: Address.parse(sender)
        },
        EXOTIC_CODE
    );

    const exoticAddress = exotic.address.toString({
        urlSafe: true,
        bounceable: true
    });

    const stateInit = beginCell().store(storeStateInit(exotic.init!)).endCell();

    return {
        address: exoticAddress,
        amount: toNano('0.06').toString(),
        stateInit: stateInit.toBoc().toString('base64'),
        payload: buildVerifyMerkleProof(buildSuccessMerkleProof()).toBoc().toString('base64')
    };
}

export function sender(this: EvalContext, format: 'raw' | 'bounceable' | 'non-bounceable') {
    if (!this?.wallet?.account.address) {
        console.error('Invalid context for senderResolver provided');
        return undefined;
    }
    const sender = Address.parse(this.wallet.account.address);

    switch (format) {
        case 'raw':
            return sender.toRawString();
        case 'bounceable':
            return sender.toString({ bounceable: true });
        case 'non-bounceable':
            return sender.toString({ bounceable: false });
        default:
            console.error('Invalid format for senderResolver provided');
            return undefined;
    }
}

export function updateMerkleProofMessage(this: EvalContext) {
    if (!this?.wallet?.account.address) {
        console.error('Invalid context for updateMerkleProofMessage provided');
        return undefined;
    }
    const sender = this.wallet.account.address;

    const exotic = Exotic.createFromConfig(
        {
            owner: Address.parse(sender)
        },
        EXOTIC_CODE
    );

    const exoticAddress = exotic.address.toString({
        bounceable: true,
        urlSafe: true
    });

    const stateInit = beginCell().store(storeStateInit(exotic.init!)).endCell();

    return {
        address: exoticAddress,
        amount: toNano('0.06').toString(),
        stateInit: stateInit.toBoc().toString('base64'),
        payload: buildVerifyMerkleUpdate(buildSuccessMerkleUpdate()).toBoc().toString('base64')
    };
}

export function mintJettonWithDeployMessage(this: EvalContext) {
    if (!this?.wallet?.account.address) {
        console.error('Invalid context for mintJettonWithDeployMessage provided');
        return undefined;
    }
    const sender = Address.parse(this.wallet.account.address);

    const jettonMaster = createJettonMaster(sender);

    const stateInit = beginCell().store(storeStateInit(jettonMaster.init!)).endCell();

    return {
        address: jettonMaster.address.toString({
            urlSafe: true,
            bounceable: true
        }),
        amount: toNano('0.06').toString(),
        stateInit: stateInit.toBoc().toString('base64'),
        payload: mintMessage({ from: jettonMaster.address, to: sender }).toBoc().toString('base64')
    };
}

export function mintJettonWithoutDeployMessage(this: EvalContext) {
    if (!this?.wallet?.account.address) {
        console.error('Invalid context for mintJettonWithDeployMessage provided');
        return undefined;
    }
    const sender = Address.parse(this.wallet.account.address);

    const jettonMaster = createJettonMaster(sender);

    return {
        address: jettonMaster.address.toString({
            urlSafe: true,
            bounceable: true
        }),
        amount: toNano('0.06').toString(),
        payload: mintMessage({ from: jettonMaster.address, to: sender }).toBoc().toString('base64')
    };
}

export function mainnet() {
    return CHAIN.MAINNET;
}

export function testnet() {
    return CHAIN.TESTNET;
}

export function maxMessages(this: EvalContext) {
    if (!this?.wallet?.account.walletStateInit) {
        console.error('Invalid wallet for maxMessages provided');
        return undefined;
    }

    const stateInit = this.wallet?.account?.walletStateInit;
    const address = Address.parse(this?.wallet.account.address).toString({
        urlSafe: true,
        bounceable: false
    });

    const walletVersion = determineWalletVersion(stateInit);

    const messagesCount = ['v5r1', 'v5beta'].includes(walletVersion!) ? 255 : 4;
    return new Array(messagesCount).fill(null).map(() => ({
        address,
        amount: '10000'
    }));
}

export function tonProofPayload(this: EvalContext) {
    return this?.tonProof;
}

export function appHost() {
    return window.location.hostname;
}

export function appHostLength() {
    return window.location.hostname.length;
}
