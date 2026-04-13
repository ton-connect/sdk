import { describe, it, expect } from 'vitest';
import { generateUniversalLink } from 'src/provider/bridge/universal-link';
import { wireRequestParser } from 'src/parsers/wire-request-parser';
import { CASES } from './fixtures/universal-link.fixtures';

describe.each(CASES)(
    'generateUniversalLink — $label',
    ({ universalLink, sessionId, traceId, connectRequest, txRequest, maxLength }) => {
        const buildUrl = () => {
            const appRequest =
                txRequest !== null
                    ? wireRequestParser.convertToWireRequest({
                          method: 'sendTransaction',
                          request: txRequest
                      })
                    : undefined;

            return generateUniversalLink(universalLink, connectRequest, {
                sessionId,
                traceId,
                appRequest
            });
        };

        it('generates the expected URL', () => {
            expect(buildUrl()).toMatchSnapshot();
        });

        it(`URL length is within ${String(maxLength)} chars`, () => {
            expect(buildUrl().length).toBeLessThanOrEqual(maxLength);
        });
    }
);
