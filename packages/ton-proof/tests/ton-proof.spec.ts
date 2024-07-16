import { beginCell, storeStateInit } from '@ton/ton';
import { mnemonicNew, mnemonicToWalletKey, sha256 } from '@ton/crypto';
import { sign } from 'tweetnacl';
import {
    CHAIN,
    CheckProofRequestDto,
    TonProofService,
    WalletContractV4R1
} from '../src/ton-proof-service';

describe('TonProofService', () => {
    let tonProofService: TonProofService;
    const customDomains = ['example.com', 'test.com'];

    beforeEach(() => {
        tonProofService = new TonProofService({ allowedDomains: customDomains });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should initialize with custom allowed domains', () => {
        expect((tonProofService as any).allowedDomains).toEqual(customDomains);
    });

    test('should generate a random payload', () => {
        const payload = tonProofService.generatePayload();
        expect(payload).toHaveLength(64);
    });

    test('should return false if publicKey is not obtained', async () => {
        const payload = {
            address: 'address',
            proof: {
                state_init: 'state_init',
                domain: { value: 'example.com', lengthBytes: 11 },
                signature: 'signature',
                payload: 'payload',
                timestamp: Math.floor(Date.now() / 1000)
            }
        };
        const getWalletPublicKey = jest.fn().mockResolvedValue(null);

        const result = await tonProofService.checkProof(
            payload as CheckProofRequestDto,
            getWalletPublicKey
        );
        expect(result).toBe(false);
    });

    test('should return true for valid tonProof', async () => {
        const proofPayload = tonProofService.generatePayload();
        const mnemonic = await mnemonicNew();
        const keyPair = await mnemonicToWalletKey(mnemonic);
        const wallet = WalletContractV4R1.create({ publicKey: keyPair.publicKey, workchain: 0 });
        const payloadBuffer = Buffer.from(proofPayload, 'hex');
        const stateInit = beginCell().store(storeStateInit(wallet.init)).endCell();

        const timestamp = Math.floor(Date.now() / 1000) + 100000;
        const address = wallet.address.toRawString();
        const domain = 'example.com';
        const lengthBytes = domain.length;

        const wc = Buffer.alloc(4);
        wc.writeUInt32BE(wallet.address.workChain, 0);

        const ts = Buffer.alloc(8);
        ts.writeBigUInt64LE(BigInt(timestamp), 0);

        const dl = Buffer.alloc(4);
        dl.writeUInt32LE(lengthBytes, 0);

        // message = utf8_encode("ton-proof-item-v2/") ++
        //           Address ++
        //           AppDomain ++
        //           Timestamp ++
        //           Payload
        const msg = Buffer.concat([
            Buffer.from('ton-proof-item-v2/'),
            wc,
            wallet.address.hash,
            dl,
            Buffer.from(domain),
            ts,
            Buffer.from(payloadBuffer.toString('base64'))
        ]);

        const msgHash = Buffer.from(await sha256(msg));

        // signature = Ed25519Sign(privkey, sha256(0xffff ++ utf8_encode("ton-connect") ++ sha256(message)))
        const fullMsg = Buffer.concat([
            Buffer.from([0xff, 0xff]),
            Buffer.from('ton-connect'),
            msgHash
        ]);

        const buff = Buffer.from(await sha256(fullMsg));
        const payload: CheckProofRequestDto = {
            address,
            network: CHAIN.MAINNET,
            public_key: keyPair.publicKey.toString('hex'),
            proof: {
                state_init: stateInit.toBoc().toString('base64'),
                domain: {
                    value: domain,
                    lengthBytes
                },
                signature: Buffer.from(
                    sign.detached(Uint8Array.from(buff), keyPair.secretKey)
                ).toString('base64'),
                payload: payloadBuffer.toString('base64'),
                timestamp
            }
        };
        const getWalletPublicKey = jest.fn().mockResolvedValue(null);

        const result = await tonProofService.checkProof(payload, getWalletPublicKey);
        expect(result).toBe(true);
    });
});
