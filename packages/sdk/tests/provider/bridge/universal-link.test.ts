import { describe, it, expect } from 'vitest';
import { generateUniversalLink } from 'src/provider/bridge/universal-link';
import { wireRequestParser } from 'src/parsers/wire-request-parser';
import { CASES } from './fixtures/universal-link.fixtures';

// Mirrors BridgeProvider.maxUrlLength: above it the embedded request is dropped
// and the connect-only link is used instead.
const MAX_LENGTH = 1024;

describe.each(CASES)(
    'generateUniversalLink — $label',
    ({ universalLink, sessionId, traceId, connectRequest, txRequest, exceedsMaxUrlLength }) => {
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

        const buildConnectOnlyUrl = () =>
            generateUniversalLink(universalLink, connectRequest, { sessionId, traceId });

        it('generates the expected URL', () => {
            expect(buildUrl()).toMatchSnapshot();
        });

        if (exceedsMaxUrlLength) {
            it(`URL exceeds ${String(MAX_LENGTH)} chars, connect-only link still fits`, () => {
                expect(buildUrl().length).toBeGreaterThan(MAX_LENGTH);
                expect(buildConnectOnlyUrl().length).toBeLessThanOrEqual(MAX_LENGTH);
            });
        } else {
            it(`URL length is within ${String(MAX_LENGTH)} chars`, () => {
                expect(buildUrl().length).toBeLessThanOrEqual(MAX_LENGTH);
            });
        }
    }
);
