import { describe, it, expect } from 'vitest';

import { TonConnectError } from 'src/errors/ton-connect.error';
import { UserRejectsError } from 'src/errors/protocol/events/connect/user-rejects.error';

type ErrorClass = typeof TonConnectError;

// Every error module, not only the ones re-exported from the package barrel:
// a class that is thrown but not exported still reaches the dApp.
const errorModules = import.meta.glob<Record<string, unknown>>('../../src/errors/**/*.error.ts', {
    eager: true
});

const errorClasses: ErrorClass[] = Object.values(errorModules)
    .flatMap(module => Object.values(module))
    .filter(
        (value): value is ErrorClass =>
            typeof value === 'function' &&
            (value === TonConnectError || value.prototype instanceof TonConnectError)
    );

function instantiate(ErrorConstructor: ErrorClass): TonConnectError {
    return new ErrorConstructor('details', { cause: {} as never });
}

describe('error identity', () => {
    it('finds the error classes', () => {
        expect(errorClasses.length).toBeGreaterThanOrEqual(18);
    });

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

            it('exposes the class name as a non-enumerable name', () => {
                const error = instantiate(ErrorConstructor);

                expect(error.name).toBe(className);
                expect(Object.keys(error)).not.toContain('name');
            });

            it('keeps the message format with the class name', () => {
                const error = instantiate(ErrorConstructor);

                expect(error.message.startsWith(`[TON_CONNECT_SDK_ERROR] ${className}`)).toBe(true);
                expect(error.message.endsWith('\ndetails')).toBe(true);
            });

            it('keeps the instanceof chain', () => {
                const error = instantiate(ErrorConstructor);

                expect(error).toBeInstanceOf(ErrorConstructor);
                expect(error).toBeInstanceOf(TonConnectError);
                expect(error).toBeInstanceOf(Error);
            });
        }
    );

    it('names a third-party subclass without errorName after its own class', () => {
        class CustomRejectsError extends UserRejectsError {}

        const error = new CustomRejectsError();

        expect(error.name).toBe('CustomRejectsError');
        expect(error).toBeInstanceOf(CustomRejectsError);
        expect(error).toBeInstanceOf(UserRejectsError);
    });
});
