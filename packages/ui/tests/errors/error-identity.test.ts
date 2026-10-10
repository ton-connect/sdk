// @vitest-environment node
import { describe, it, expect, beforeAll } from 'vitest';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { build, type Rollup } from 'vite';
import { TonConnectError } from '@tonconnect/sdk';

import { TonConnectUIError } from 'src/errors/ton-connect-ui.error';
import { WalletNotFoundError } from 'src/errors/configuration/wallet-not-found.error';

const errorClasses = [TonConnectUIError, WalletNotFoundError];

describe('UI error identity', () => {
    describe.each(errorClasses.map(ErrorConstructor => [ErrorConstructor.name, ErrorConstructor]))(
        '%s',
        (className, ErrorConstructor) => {
            it('declares its own errorName equal to the class name', () => {
                expect(Object.prototype.hasOwnProperty.call(ErrorConstructor, 'errorName')).toBe(
                    true
                );
                expect((ErrorConstructor as unknown as { errorName: string }).errorName).toBe(
                    className
                );
            });

            it('exposes the class name and keeps the instanceof chain', () => {
                const error = new ErrorConstructor('details');

                expect(error.name).toBe(className);
                expect(error.message.startsWith(`[TON_CONNECT_SDK_ERROR] ${className}`)).toBe(true);
                expect(error).toBeInstanceOf(ErrorConstructor);
                expect(error).toBeInstanceOf(TonConnectError);
            });
        }
    );
});

// The UI classes extend TonConnectError from the separately built SDK package;
// a dApp bundles and minifies both together.
describe('UI error names in a minified bundle', () => {
    const srcDir = fileURLToPath(new URL('../../src', import.meta.url));
    const entry = fileURLToPath(new URL('./errors-entry.ts', import.meta.url));

    let bundleCode: string;
    let errors: Record<string, new (message?: string) => Error>;

    beforeAll(async () => {
        const result = (await build({
            configFile: false,
            logLevel: 'silent',
            resolve: { alias: { src: srcDir } },
            build: {
                write: false,
                minify: 'esbuild',
                lib: { entry, formats: ['iife'], name: 'TonConnectUIErrors' }
            }
        })) as Rollup.RollupOutput[];

        bundleCode = result[0]!.output[0].code;
        // The SDK part of the bundle needs Node globals such as Buffer at load time.
        errors = vm.runInThisContext(`${bundleCode};TonConnectUIErrors`);
    }, 60_000);

    it('is actually minified, so class names are mangled', () => {
        expect(bundleCode).not.toContain('class TonConnectUIError');
    });

    it.each(['TonConnectUIError', 'WalletNotFoundError'])('%s keeps its name', className => {
        const error = new errors[className]!('details');

        expect(error.name).toBe(className);
        expect(error.message.startsWith(`[TON_CONNECT_SDK_ERROR] ${className}`)).toBe(true);
    });
});
