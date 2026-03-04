import { describe, it, expect } from 'vitest';
import { encodeTelegramUrlParameters, decodeTelegramUrlParameters } from 'src/utils/url';

const BASE_URL = 'https://t.me/wallet/start?startapp=tonconnect-';
const CONNECT_PARAMS =
    'v=2&id=1a7894bfea897afa462bc8ccc6857c992cc92b0a5ef994ab2f855e764ece4942&r=%7B%22manifestUrl%22%3A%22https%3A%2F%2Fsdk-demo-dapp-react-git-feat-intent-transactions-topteam.vercel.app%2Ftonconnect-manifest.json%22%2C%22items%22%3A%5B%7B%22name%22%3A%22ton_addr%22%7D%2C%7B%22name%22%3A%22ton_proof%22%2C%22payload%22%3A%223637a1d68fc8938f3263531eb21a2e2761b5a457486e0a62ee38465857f1a827%22%7D%5D%7D&ret=none';
const CONNECT_URL =
    'https://t.me/wallet/start?startapp=tonconnect-v__2-id__1a7894bfea897afa462bc8ccc6857c992cc92b0a5ef994ab2f855e764ece4942-r__--7B--22manifestUrl--22--3A--22https--3A--2F--2Ftonconnect--2Dsdk--2Ddemo--2Ddapp--2Evercel--2Eapp--2Ftonconnect--2Dmanifest--2Ejson--22--2C--22items--22--3A--5B--7B--22name--22--3A--22ton--5Faddr--22--7D--2C--7B--22name--22--3A--22ton--5Fproof--22--2C--22payload--22--3A--223637a1d68fc8938f3263531eb21a2e2761b5a457486e0a62ee38465857f1a827--22--7D--5D--7D-ret__none';

const TRANSACTION_PARAMS =
    'id=17b086055e59e7c87fee47797e92be1a51be0dd1a42f2a39131f79cf5169682e&ret=back';
const TRANSACTION_URL =
    'https://t.me/wallet/start?startapp=tonconnect-id__17b086055e59e7c87fee47797e92be1a51be0dd1a42f2a39131f79cf5169682e-ret__back';

describe.each([
    {
        baseUrl: BASE_URL,
        params: CONNECT_PARAMS,
        expected: CONNECT_URL
    },
    {
        baseUrl: BASE_URL,
        params: TRANSACTION_PARAMS,
        expected: TRANSACTION_URL
    }
])(`urls: encodeTelegramUrlParameters`, ({ baseUrl, params, expected }) => {
    it(`encodeTelegramUrlParameters returns ${expected} for ${params}`, () => {
        const encodedParams = encodeTelegramUrlParameters(params);
        expect(baseUrl + encodedParams).toEqual(expected);
    });
    it(`decodeTelegramUrlParameters returns ${expected} for ${params}`, () => {
        const encodedParams = encodeTelegramUrlParameters(params);
        const decodedParams = decodeTelegramUrlParameters(encodedParams);
        expect(decodedParams).toEqual(params);
    });
});
