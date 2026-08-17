import { describe, it, expect } from 'vitest';
import { generateUniversalLink } from 'src/provider/bridge/universal-link';
import { wireRequestParser } from 'src/parsers/wire-request-parser';
import { MAX_UNIVERSAL_LINK_LENGTH } from 'src/constants/max-universal-link-length';
import { CASES } from './fixtures/universal-link.fixtures';

// The single source of truth for the length cap (issue #584): the same constant
// BridgeProvider uses to decide when to drop the embedded request. Imported here
// instead of re-declaring `1024` so the test cannot silently drift from the SDK.
const MAX_LENGTH = MAX_UNIVERSAL_LINK_LENGTH;

it('MAX_UNIVERSAL_LINK_LENGTH is the shared 1024-char cap', () => {
    expect(MAX_UNIVERSAL_LINK_LENGTH).toBe(1024);
});

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
