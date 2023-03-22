import { afterEach, describe, expect, Mock, vitest } from 'vitest';
import { fetchMocker } from 'tests/setup';
import { WalletsListManager } from 'src/wallets-list-manager';
import { defaultWalletsList, walletsListWithWrongWallet, wrongWalletsList } from './mock-data';
import { FetchWalletsError } from 'src/errors';

const originalConsoleDebug = console.debug;
describe('Wallets list manager tests', () => {
    let walletsListManager: WalletsListManager;

    let consoleDebugMock: Mock;

    const mockFetch = (walletsListSource: object) =>
        fetchMocker.mockIf(walletsListManager['walletsListSource'], () => ({
            body: JSON.stringify(walletsListSource)
        }));

    beforeEach(() => {
        consoleDebugMock = vitest.fn();
        console.debug = consoleDebugMock;
        walletsListManager = new WalletsListManager();
    });

    afterEach(() => {
        console.debug = originalConsoleDebug;
    });

    it('Should parse correct config', async () => {
        mockFetch(defaultWalletsList.source);

        const walletsList = await walletsListManager.getWallets();

        expect(walletsList).toEqual(defaultWalletsList.parsed);
    });

    it('Should remove wallet with wrong config', async () => {
        mockFetch(walletsListWithWrongWallet.source);

        const walletsList = await walletsListManager.getWallets();

        expect(walletsList).toEqual(walletsListWithWrongWallet.parsed);
        expect(consoleDebugMock.mock.calls.length).toEqual(1);
        expect(consoleDebugMock.mock.calls[0].join(' ')).toEqual(
            '[TON_CONNECT_SDK] Wallet(s) Tonhub config format is wrong. They were removed from the wallets list.'
        );
    });

    it('Should throw when wallets list format is incorrect', async () => {
        mockFetch(wrongWalletsList.source);

        await expect(walletsListManager.getWallets()).rejects.toEqual(
            new FetchWalletsError('Wrong wallets list format, wallets list must be an array.')
        );
    });

    it("Should throw when can't load the wallets list", async () => {
        fetchMocker.mockIf(walletsListManager['walletsListSource'], () => ({
            code: 400,
            body: ''
        }));

        await expect(walletsListManager.getWallets()).rejects.toEqual(
            new FetchWalletsError(
                'FetchError: invalid json response body at  reason: Unexpected end of JSON input'
            )
        );
    });

    it('Should parse custom wallets list', async () => {
        const walletsListSourceString = process.env.VITE_WALLETS_LIST;

        if (!walletsListSourceString) {
            return;
        }

        const walletsListSource: unknown = JSON.parse(walletsListSourceString);

        if (!Array.isArray(walletsListSource)) {
            throw new Error('Wallets list must be an array.');
        }

        fetchMocker.mockIf(walletsListManager['walletsListSource'], () => ({
            body: walletsListSourceString
        }));

        const walletsList = await walletsListManager.getWallets();

        expect(walletsList.length).toEqual(walletsListSource.length);
    });
});
