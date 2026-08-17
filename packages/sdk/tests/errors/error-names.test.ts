import { describe, it, expect } from 'vitest';

import { TonConnectError } from 'src/errors/ton-connect.error';
import { UnknownError } from 'src/errors/unknown.error';
import { FetchWalletsError } from 'src/errors/wallets-manager/fetch-wallets.error';
import { ParseHexError } from 'src/errors/binary/parse-hex.error';
import { WrongAddressError } from 'src/errors/address/wrong-address.error';
import { ManifestContentErrorError } from 'src/errors/protocol/events/connect/manifest-content-error.error';
import { UserRejectsError } from 'src/errors/protocol/events/connect/user-rejects.error';
import { ManifestNotFoundError } from 'src/errors/protocol/events/connect/manifest-not-found.error';
import { UnknownAppError } from 'src/errors/protocol/responses/unknown-app.error';
import { BadRequestError } from 'src/errors/protocol/responses/bad-request.error';
import { DappMetadataError } from 'src/errors/dapp/dapp-metadata.error';
import { LocalstorageNotFoundError } from 'src/errors/storage/localstorage-not-found.error';
import { WalletAlreadyConnectedError } from 'src/errors/wallet/wallet-already-connected.error';
import { WalletNotSupportFeatureError } from 'src/errors/wallet/wallet-not-support-feature.error';
import { WalletNotConnectedError } from 'src/errors/wallet/wallet-not-connected.error';
import { WalletNotInjectedError } from 'src/errors/wallet/wallet-not-injected.error';

// Regression for #460: in a minified production bundle every class is renamed to
// a single letter, so a message built from `this.constructor.name` shows garbage
// like `[TON_CONNECT_SDK_ERROR] A`. Each error must instead carry a stable string
// `name` and surface it in the message. These assertions compare against string
// literals (never `constructor.name`) so they would fail if the fix regressed.

describe('errors: names survive minification', () => {
    const cases: [new (m?: string) => TonConnectError, string][] = [
        [TonConnectError, 'TonConnectError'],
        [UnknownError, 'UnknownError'],
        [FetchWalletsError, 'FetchWalletsError'],
        [ParseHexError, 'ParseHexError'],
        [WrongAddressError, 'WrongAddressError'],
        [ManifestContentErrorError, 'ManifestContentErrorError'],
        [UserRejectsError, 'UserRejectsError'],
        [ManifestNotFoundError, 'ManifestNotFoundError'],
        [UnknownAppError, 'UnknownAppError'],
        [BadRequestError, 'BadRequestError'],
        [DappMetadataError, 'DappMetadataError'],
        [LocalstorageNotFoundError, 'LocalstorageNotFoundError'],
        [WalletAlreadyConnectedError, 'WalletAlreadyConnectedError'],
        [WalletNotSupportFeatureError, 'WalletNotSupportFeatureError'],
        [WalletNotConnectedError, 'WalletNotConnectedError'],
        [WalletNotInjectedError, 'WalletNotInjectedError']
    ];

    it.each(cases)('%o has a stable name and shows it in the message', (Ctor, expectedName) => {
        const error = new Ctor();

        // `.name` is a stable string literal, independent of the (minifiable)
        // runtime class name.
        expect(error.name).toBe(expectedName);

        // The human-readable message carries the real class name, not a
        // single-letter minified identifier.
        expect(error.message).toContain(`[TON_CONNECT_SDK_ERROR] ${expectedName}`);
    });

    it('keeps the caller-provided message after the prefix and name', () => {
        const error = new UserRejectsError('extra context');
        expect(error.message).toContain('[TON_CONNECT_SDK_ERROR] UserRejectsError');
        expect(error.message).toContain('extra context');
    });

    it('still resolves instanceof through the subclass and base', () => {
        const error = new UserRejectsError();
        expect(error).toBeInstanceOf(UserRejectsError);
        expect(error).toBeInstanceOf(TonConnectError);
        expect(error).toBeInstanceOf(Error);
    });
});
