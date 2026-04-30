import { describe, it, expect } from 'vitest';
import { generateUniversalLink } from 'src/provider/bridge/universal-link';
import { wireRequestParser } from 'src/parsers/wire-request-parser';
import { CASES } from './fixtures/universal-link.fixtures';

const MAX_LENGTH = 1024;

describe.each(CASES)(
    'generateUniversalLink — $label',
    ({ universalLink, sessionId, traceId, connectRequest, txRequest }) => {
        const buildUrl = () => {
            const embeddedRequest =
                txRequest !== null
                    ? wireRequestParser.convertToWireEmbeddedRequest({
                          method: 'sendTransaction',
                          request: txRequest
                      })
                    : undefined;

            return generateUniversalLink(universalLink, connectRequest, {
                sessionId,
                traceId,
                embeddedRequest
            });
        };

        it('generates the expected URL', () => {
            expect(buildUrl()).toMatchSnapshot();
        });

        it(`URL length is within ${String(MAX_LENGTH)} chars`, () => {
            expect(buildUrl().length).toBeLessThanOrEqual(MAX_LENGTH);
        });
    }
);
