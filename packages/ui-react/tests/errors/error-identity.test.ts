// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { TonConnectError } from '@tonconnect/ui';

import { TonConnectUIReactError } from '../../src/errors/ton-connect-ui-react.error';
import { TonConnectProviderNotSetError } from '../../src/errors/ton-connect-provider-not-set.error';

const errorClasses = [TonConnectUIReactError, TonConnectProviderNotSetError];

describe('UI React error identity', () => {
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
                expect(error).toBeInstanceOf(ErrorConstructor);
                expect(error).toBeInstanceOf(TonConnectError);
            });
        }
    );
});
