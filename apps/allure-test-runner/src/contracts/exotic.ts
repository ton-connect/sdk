import {
    Address,
    beginCell,
    Cell,
    type Contract,
    contractAddress,
    type ContractProvider,
    Dictionary,
    type MessageRelaxed,
    type Sender,
    SendMode,
    storeMessageRelaxed
} from '@ton/core';
import { Buffer } from 'buffer';

export const EXOTIC_CODE = Cell.fromBoc(
    Buffer.from(
        'b5ee9c7241020501000116000114ff00f4a413f4bcf2c80b01020162020401f8d020d749c120915be001d0d3030171b0c001915be0fa403001d31f01208210c5375235ba8e4e30d3ffd4300101d7399ed30701c003925b70e1d3ff3001ba925b70e2948b24f4b8978b54552524f528e2708040c87001cb1f5003cf16c8801001cb055004cf1601fa027001cb6a58cf17c901fb00e020821036ca91200300f6ba8e4e30d3ffd4300101d7399ed30701c004925b70e1d3ff3001ba925b70e2948b24f4b8978b54552524f528e2708040c87001cb1f5003cf16c8801001cb055004cf1601fa027001cb6a58cf17c901fb00e082100bc2883bba8e1aed44d00281200103c70512f2f49320d74a96d307d402fb00e830e05b840ff2f0000ba0734bda89a1de6635a5',
        'hex'
    )
)[0]!;

export const Opcode = {
    VerifyMerkleProof: 0xc5375235,
    VerifyMerkleUpdate: 0x36ca9120,
    SendFromOwner: 0xbc2883b
};

export type VerifyMerkleProof = { merkleRoot: Buffer; merkleProof: Cell };

export function buildVerifyMerkleProof(merkle: VerifyMerkleProof) {
    return beginCell()
        .storeUint(Opcode.VerifyMerkleProof, 32)
        .storeBuffer(merkle.merkleRoot, 32)
        .storeRef(merkle.merkleProof)
        .endCell();
}

export type VerifyMerkleUpdate = { merkleRoot: Buffer; merkleUpdate: Cell };

export function buildVerifyMerkleUpdate(merkle: VerifyMerkleUpdate) {
    return beginCell()
        .storeUint(Opcode.VerifyMerkleUpdate, 32)
        .storeBuffer(merkle.merkleRoot, 32)
        .storeRef(merkle.merkleUpdate)
        .endCell();
}

export type SendFromOwner = {
    messages: MessageRelaxed[];
    mode: number;
};

export function buildSendFromOwner(opts: SendFromOwner) {
    if (opts.messages.length > 4) {
        throw new Error('Too many messages, must not be greater than 4.');
    }

    const body = beginCell().storeUint(Opcode.SendFromOwner, 32);

    for (const message of opts.messages) {
        body.storeUint(opts.mode, 8);
        body.storeRef(beginCell().store(storeMessageRelaxed(message)).endCell());
    }

    return body.endCell();
}

export function randomAddress(workchain = 0): Address {
    const b = Buffer.alloc(32);
    for (let i = 0; i < 32; i++) {
        b[i] = Math.floor(Math.random() * 256);
    }
    return new Address(workchain, b);
}

export function merkleFixture() {
    const dict = Dictionary.empty(Dictionary.Keys.Address(), Dictionary.Values.Bool());
    const address = randomAddress();
    dict.set(address, true);
    for (let i = 0; i < 10; i++) {
        dict.set(randomAddress(), true);
    }
    const merkleRoot = beginCell().storeDictDirect(dict).endCell().hash();

    return { dict, address, merkleRoot };
}

export function buildSuccessMerkleProof() {
    const { dict, merkleRoot, address } = merkleFixture();
    const merkleProof = dict.generateMerkleProof([address]);
    return { merkleRoot, merkleProof };
}

export function buildSuccessMerkleUpdate() {
    const { dict, address, merkleRoot } = merkleFixture();
    const merkleUpdate = dict.generateMerkleUpdate(address, false); // NOTE: this updates dictionary with new value
    return { merkleRoot, merkleUpdate };
}

export type ExoticConfig = {
    owner: Address;
};

export function exoticConfigToCell(config: ExoticConfig): Cell {
    return beginCell().storeAddress(config.owner).endCell();
}

export class Exotic implements Contract {
    address: Address;
    init?: { code: Cell; data: Cell };

    constructor(address: Address, init?: { code: Cell; data: Cell }) {
        this.address = address;
        this.init = init;
    }

    static createFromAddress(address: Address) {
        return new Exotic(address);
    }

    static createFromConfig(config: ExoticConfig, code: Cell, workchain = 0) {
        const data = exoticConfigToCell(config);
        const init = { code, data };
        return new Exotic(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell()
        });
    }

    async sendVerifyMerkleProof(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: VerifyMerkleProof
    ) {
        const body = buildVerifyMerkleProof(opts);

        return provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body
        });
    }

    async sendVerifyMerkleUpdate(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: VerifyMerkleUpdate
    ) {
        const body = buildVerifyMerkleUpdate(opts);

        return provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body
        });
    }

    async sendFromOwner(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: SendFromOwner
    ) {
        const body = buildSendFromOwner(opts);

        return provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body
        });
    }
}
