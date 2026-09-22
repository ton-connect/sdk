import { describe, it, expect, beforeAll } from 'vitest';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { build, type Rollup } from 'vite';

// dApps ship the SDK through their own minifying bundler, which renames classes.
// Build a fresh minified bundle from source (never a stale dist) and check that
// error identity survives it.
const srcDir = fileURLToPath(new URL('../../src', import.meta.url));

type ErrorConstructor = new (message?: string) => Error;

let bundleCode: string;
let errors: Record<string, ErrorConstructor>;

beforeAll(async () => {
    const result = (await build({
        configFile: false,
        logLevel: 'silent',
        resolve: { alias: { src: srcDir } },
        build: {
            write: false,
            minify: 'esbuild',
            lib: { entry: `${srcDir}/errors/index.ts`, formats: ['iife'], name: 'TonConnectErrors' }
        }
    })) as Rollup.RollupOutput[];

    bundleCode = result[0]!.output[0].code;
    errors = vm.runInNewContext(`${bundleCode};TonConnectErrors`) as Record<
        string,
        ErrorConstructor
    >;
}, 60_000);

describe('error names in a minified bundle', () => {
    it('is actually minified, so class names are mangled', () => {
        expect(bundleCode).not.toContain('class UserRejectsError');
    });

    it.each(['UserRejectsError', 'BadRequestError', 'UnknownError', 'TonConnectError'])(
        '%s keeps its name, message prefix and string form',
        className => {
            const error = new errors[className]!('details');

            expect(error.name).toBe(className);
            expect(error.message.startsWith(`[TON_CONNECT_SDK_ERROR] ${className}`)).toBe(true);
            expect(
                String(error).startsWith(`${className}: [TON_CONNECT_SDK_ERROR] ${className}`)
            ).toBe(true);
        }
    );
});
