import { describe, expect, Mock } from 'vitest';
import { fetchMocker } from 'tests/setup';
import { WalletsListManager } from 'src/wallets-list-manager';
import { defaultWalletsList, walletsListWithWrongWallet, wrongWalletsList } from './mock-data';
import { FALLBACK_WALLETS_LIST } from 'src/resources/fallback-wallets-list';
import { FetchWalletsError } from 'src/errors';
import { logError } from '../../src/utils/log';

vi.mock('../../src/utils/log', () => {
    return {
        logError: vi.fn()
    };
});

describe('Wallets list manager tests', () => {
    let walletsListManager: WalletsListManager;

    let consoleErrorMock: Mock;

    const mockFetch = (walletsListSource: object) =>
        fetchMocker.mockIf(walletsListManager['walletsListSource'], () => ({
            body: JSON.stringify(walletsListSource)
        }));

    beforeEach(() => {
        consoleErrorMock = vi.fn();

        walletsListManager = new WalletsListManager();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.resetAllMocks();
    });

    it('Should parse correct config', async () => {
        mockFetch(defaultWalletsList.source);

        const walletsList = await walletsListManager.getWallets();

        expect(logError).toBeCalledTimes(0);
        expect(walletsList).toEqual(defaultWalletsList.parsed);
    });

    it('Should remove wallet with wrong config', async () => {
        mockFetch(walletsListWithWrongWallet.source);

        const walletsList = await walletsListManager.getWallets();

        expect(walletsList).toEqual(walletsListWithWrongWallet.parsed);
        expect(logError).toBeCalledTimes(1);
        expect(logError).toBeCalledWith(
            'Wallet(s) Tonhub, TonFlow, DeWallet config format is wrong. They were removed from the wallets list.'
        );
    });

    it('Should use fallback wallets list if fetched wallets list format is incorrect', async () => {
        mockFetch(wrongWalletsList.source);

        const walletsList = await walletsListManager.getWallets();

        expect(logError).toBeCalledTimes(1);
        expect(logError).toBeCalledWith(
            new FetchWalletsError('Wrong wallets list format, wallets list must be an array.')
        );
        expect(walletsList).toEqual(
            walletsListManager['walletConfigDTOListToWalletConfigList'](FALLBACK_WALLETS_LIST)
        );
    });

    it("Should use fallback wallets list when can't load the wallets list", async () => {
        fetchMocker.mockIf(walletsListManager['walletsListSource'], () => ({
            code: 400,
            body: ''
        }));

        const walletsList = await walletsListManager.getWallets();

        expect(logError).toBeCalledTimes(1);

        expect((logError as Mock).mock.calls[0].toString()).toEqual(
            'FetchError: invalid json response body at  reason: Unexpected end of JSON input'
        );
        expect(walletsList).toEqual(
            walletsListManager['walletConfigDTOListToWalletConfigList'](FALLBACK_WALLETS_LIST)
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
        expect(consoleErrorMock.mock.calls.length).toEqual(0);
    });
});
