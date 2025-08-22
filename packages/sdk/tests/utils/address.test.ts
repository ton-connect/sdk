import { describe, it, expect } from 'vitest';

import { parseUserFriendlyAddress, toUserFriendlyAddress, hexToBytes } from 'src/utils/address';

const MASTERCHAIN = -1;
const WORKCHAIN = 0;
const HASH = '3333333333333333333333333333333333333333333333333333333333333333';

const BOUNCEABLE_MASTERCHAIN_MAINNET_ADDRESS = 'Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vF';
const BOUNCEABLE_MASTERCHAIN_TESTNET_ADDRESS = 'kf8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM_BP';

const NON_BOUNCEABLE_MASTERCHAIN_MAINNET_ADDRESS = 'Uf8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMxYA';
const NON_BOUNCEABLE_MASTERCHAIN_TESTNET_ADDRESS = '0f8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM62K';

const BOUNCEABLE_WORKCHAIN_MAINNET_ADDRESS = 'EQAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM7SN';
const BOUNCEABLE_WORKCHAIN_TESTNET_ADDRESS = 'kQAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMw8H';

const NON_BOUNCEABLE_WORKCHAIN_MAINNET_ADDRESS = 'UQAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM-lI';
const NON_BOUNCEABLE_WORKCHAIN_TESTNET_ADDRESS = '0QAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM1LC';

describe.each([

    {
        address: BOUNCEABLE_MASTERCHAIN_MAINNET_ADDRESS,
        expected: { wc: MASTERCHAIN, hex: HASH, testOnly: false, isBounceable: true }
    },
    {
        address: NON_BOUNCEABLE_MASTERCHAIN_MAINNET_ADDRESS,
        expected: { wc: MASTERCHAIN, hex: HASH, testOnly: false, isBounceable: false }
    },
    {
        address: BOUNCEABLE_MASTERCHAIN_TESTNET_ADDRESS,
        expected: { wc: MASTERCHAIN, hex: HASH, testOnly: true, isBounceable: true }
    },
    {
        address: NON_BOUNCEABLE_MASTERCHAIN_TESTNET_ADDRESS,
        expected: { wc: MASTERCHAIN, hex: HASH, testOnly: true, isBounceable: false }
    },

    {
        address: BOUNCEABLE_WORKCHAIN_MAINNET_ADDRESS,
        expected: { wc: WORKCHAIN, hex: HASH, testOnly: false, isBounceable: true }
    },
    {
        address: NON_BOUNCEABLE_WORKCHAIN_MAINNET_ADDRESS,
        expected: { wc: WORKCHAIN, hex: HASH, testOnly: false, isBounceable: false }
    },
    {
        address: BOUNCEABLE_WORKCHAIN_TESTNET_ADDRESS,
        expected: { wc: WORKCHAIN, hex: HASH, testOnly: true, isBounceable: true }
    },
    {
        address: NON_BOUNCEABLE_WORKCHAIN_TESTNET_ADDRESS,
        expected: { wc: WORKCHAIN, hex: HASH, testOnly: true, isBounceable: false }
    }

])(`utils/address parseUserFriendlyAddress($address)`, ({ address, expected }) => {
    it(`urlSafeBase64 returns { wc: ${expected.wc}, hex: ${expected.hex}, testOnly: ${expected.testOnly}, isBounceable: ${expected.isBounceable} }`, () => {
        const result = parseUserFriendlyAddress(address);
        expect(result).toEqual(expected);
    });
    it(`non-urlSafeBase64 returns { wc: ${expected.wc}, hex: ${expected.hex}, testOnly: ${expected.testOnly}, isBounceable: ${expected.isBounceable} }`, () => {
        const nonUrlSafeBase64 = address.replace(/-/g, '+').replace(/_/g, '/');
        const result = parseUserFriendlyAddress(nonUrlSafeBase64);
        expect(result).toEqual(expected);
    });
});

describe.each([
    {
        address: 'invalid-base64-address!@#$%',
        description: 'invalid base64 encoding'
    },
    {
        address: 'Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vG',
        description: 'invalid checksum'
    },
    {
        address: 'Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0v',
        description: 'invalid length (too short)'
    },
    {
        address: 'Ef8zMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM0vFAA',
        description: 'invalid length (too long)'
    },
    {
        address: 'UQEzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM2SU',
        description: 'invalid workchain'
    },
    {
        address: 'UAAzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzM3Vt',
        description: 'invalid tag'
    }
])('utils/address parseUserFriendlyAddress error cases ($description)', ({ address }) => {
    it(`throws error for ${address}`, () => {
        expect(() => parseUserFriendlyAddress(address)).toThrow();
    });
});

describe.each([
    {
        address: `${MASTERCHAIN}:${HASH}`,
        testOnly: false,
        expected: NON_BOUNCEABLE_MASTERCHAIN_MAINNET_ADDRESS
    },
    {
        address: `${WORKCHAIN}:${HASH}`,
        testOnly: false,
        expected: NON_BOUNCEABLE_WORKCHAIN_MAINNET_ADDRESS
    },
    {
        address: `${MASTERCHAIN}:${HASH}`,
        testOnly: true,
        expected: NON_BOUNCEABLE_MASTERCHAIN_TESTNET_ADDRESS
    },
    {
        address: `${WORKCHAIN}:${HASH}`,
        testOnly: true,
        expected: NON_BOUNCEABLE_WORKCHAIN_TESTNET_ADDRESS
    }
])('utils/address toUserFriendlyAddress($address, $testOnly)', ({ address, testOnly, expected }) => {
    it(`converts to user-friendly format`, () => {
        const result = toUserFriendlyAddress(address, testOnly);
        expect(result).toBe(expected);
    });

    it(`generated address can be parsed back correctly`, () => {
        const userFriendly = toUserFriendlyAddress(address, testOnly);
        const parsed = parseUserFriendlyAddress(userFriendly);
        
        const wc = address.split(':')[0] === '-1' ? -1 : 0;
        expect(parsed.wc).toBe(wc);
        expect(parsed.hex).toBe(HASH);
        expect(parsed.testOnly).toBe(testOnly);
        expect(parsed.isBounceable).toBe(false);
    });
});

describe.each([
    {
        address: '0abcdef123456789',
        description: 'missing colon'
    },
    {
        address: '0:abcdef:123456789',
        description: 'multiple colons'
    },
    {
        address: '1:3333333333333333333333333333333333333333333333333333333333333333',
        description: 'invalid workchain (not 0 or -1)'
    },
    {
        address: '0:333333333333333333333333333333333333333333333333333333333333333',
        description: 'invalid hex length (not 64 characters)'
    },
    {
        address: '0:333333333333333333333333333333333333333333333333333333333333333G',
        description: 'invalid hex characters'
    }
])('utils/address toUserFriendlyAddress error cases ($description)', ({ address }) => {
    it(`throws error for ${address}`, () => {
        expect(() => console.log(toUserFriendlyAddress(address))).toThrow();
    });
});

describe.each([
    {
        hex: '333',
        description: 'invalid hex length (not multiple of 2)'
    }
])('utils/address hexToBytes($hex) error cases ($description)', ({ hex }) => {
    it(`throws error for ${hex}`, () => {
        expect(() => hexToBytes(hex)).toThrow();
    });
});