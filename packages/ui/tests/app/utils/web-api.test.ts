// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, MockInstance } from 'vitest';
import { openLink, MAX_LINK_LENGTH } from 'src/app/utils/web-api';

describe('web-api openLink — embedded request length guard', () => {
    let openSpy: MockInstance<Window['open']>;

    beforeEach(() => {
        openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    });

    const getOpenedHref = (): string => openSpy.mock.calls[0]![0] as string;

    describe.each([
        { name: 'tc:// with e param', link: 'tc://?v=2&id=abc&r=req&e=eyJtIjoic3QifQ' },
        {
            name: 'https universal with e param',
            link: 'https://wallet.example.com/connect?v=2&id=abc&e=eyJtIjoic3QifQ'
        },
        {
            name: 't.me direct with e in startapp',
            link: 'https://t.me/wallet/start?startapp=tonconnect-v__2-id__abc-e__eyJtIjoic3QifQ'
        },
        {
            name: 't.me legacy attach with e in startapp',
            link: 'https://t.me/wallet?attach=wallet&startapp=tonconnect-v__2-id__abc-e__eyJtIjoic3QifQ'
        },
        {
            name: 'tg:// resolve deep link with e__ in startapp',
            link: 'tg://resolve?domain=wallet&appname=start&startapp=tonconnect-v__2-id__abc-e__eyJtIjoic3QifQ'
        },
        {
            name: 'wallet custom-scheme deep link with e param',
            link: 'tonkeeper-tc://?v=2&id=abc&r=req&e=eyJtIjoic3QifQ'
        },
        { name: 'no-query link', link: 'https://example.com/page' },
        {
            name: 'link of exactly MAX_LINK_LENGTH chars',
            link: `tc://?v=2&id=abc&e=${'A'.repeat(MAX_LINK_LENGTH - 'tc://?v=2&id=abc&e='.length)}`
        }
    ])('passes short links through unchanged ($name)', ({ link }) => {
        it('opens with the original href', () => {
            expect(link.length).toBeLessThanOrEqual(MAX_LINK_LENGTH);
            openLink(link);
            expect(openSpy).toHaveBeenCalledWith(link, '_self', 'noopener noreferrer');
        });
    });

    describe('strips `e` from links longer than MAX_LINK_LENGTH', () => {
        const longE = 'E'.repeat(MAX_LINK_LENGTH);

        it('tc:// — drops e=, keeps other params', () => {
            const link = `tc://?v=2&id=abc&r=req&e=${longE}`;
            expect(link.length).toBeGreaterThan(MAX_LINK_LENGTH);

            openLink(link);
            const opened = getOpenedHref();

            expect(opened).not.toContain('e=');
            expect(opened).not.toContain(longE);
            expect(opened).toContain('v=2');
            expect(opened).toContain('id=abc');
            expect(opened).toContain('r=req');
        });

        it('tc:// — `e` in middle of query string', () => {
            const link = `tc://?v=2&e=${longE}&id=abc`;
            expect(link.length).toBeGreaterThan(MAX_LINK_LENGTH);

            openLink(link);
            const opened = getOpenedHref();

            expect(opened).not.toContain('e=');
            expect(opened).not.toContain(longE);
            expect(opened).toContain('v=2');
            expect(opened).toContain('id=abc');
        });

        it('https universal — drops e=, keeps other params', () => {
            const link = `https://wallet.example.com/connect?v=2&id=abc&e=${longE}`;
            expect(link.length).toBeGreaterThan(MAX_LINK_LENGTH);

            openLink(link);
            const opened = getOpenedHref();

            expect(opened).not.toContain('e=');
            expect(opened).not.toContain(longE);
            expect(opened).toContain('v=2');
            expect(opened).toContain('id=abc');
        });

        it('t.me direct — drops e__ from startapp', () => {
            const link = `https://t.me/wallet/start?startapp=tonconnect-v__2-id__abc-r__req-e__${longE}`;
            expect(link.length).toBeGreaterThan(MAX_LINK_LENGTH);

            openLink(link);
            const opened = getOpenedHref();

            expect(opened).not.toContain('e__');
            expect(opened).not.toContain(longE);
            expect(opened).toContain('v__2');
            expect(opened).toContain('id__abc');
            expect(opened).toContain('r__req');
        });

        it('t.me legacy attach link — drops e__ and converts to direct form', () => {
            const link = `https://t.me/wallet?attach=wallet&startapp=tonconnect-v__2-id__abc-e__${longE}`;
            expect(link.length).toBeGreaterThan(MAX_LINK_LENGTH);

            openLink(link);
            const opened = getOpenedHref();

            expect(opened).not.toContain('e__');
            expect(opened).not.toContain(longE);
            expect(opened).toContain('id__abc');
        });

        it('tc:// — `e` is the only query param', () => {
            const link = `tc://?e=${longE}`;
            expect(link.length).toBeGreaterThan(MAX_LINK_LENGTH);

            openLink(link);
            const opened = getOpenedHref();

            expect(opened).not.toContain('e=');
            expect(opened).not.toContain(longE);
        });

        it('tg:// resolve — drops e__ from startapp', () => {
            const link = `tg://resolve?domain=wallet&appname=start&startapp=tonconnect-v__2-id__abc-e__${longE}`;
            expect(link.length).toBeGreaterThan(MAX_LINK_LENGTH);

            openLink(link);
            const opened = getOpenedHref();

            expect(opened).not.toContain('e__');
            expect(opened).not.toContain(longE);
            expect(opened).toContain('domain=wallet');
            expect(opened).toContain('id__abc');
        });

        it('wallet custom-scheme deep link — drops e=, keeps other params', () => {
            const link = `tonkeeper-tc://?v=2&id=abc&r=req&e=${longE}`;
            expect(link.length).toBeGreaterThan(MAX_LINK_LENGTH);

            openLink(link);
            const opened = getOpenedHref();

            expect(opened).not.toContain('e=');
            expect(opened).not.toContain(longE);
            expect(opened.startsWith('tonkeeper-tc://')).toBe(true);
            expect(opened).toContain('id=abc');
            expect(opened).toContain('r=req');
        });

        it('handles URL-encoded e values', () => {
            const longE = encodeURIComponent('A'.repeat(MAX_LINK_LENGTH));
            const link = `tc://?v=2&e=${longE}&id=abc`;
            expect(link.length).toBeGreaterThan(MAX_LINK_LENGTH);

            openLink(link);
            const opened = getOpenedHref();

            expect(opened).not.toContain('e=');
            expect(opened).toContain('id=abc');
        });

        it('strips `e` at exactly MAX_LINK_LENGTH + 1 (boundary)', () => {
            const baseLink = 'tc://?v=2&id=abc&e=';
            const link = baseLink + 'A'.repeat(MAX_LINK_LENGTH + 1 - baseLink.length);
            expect(link.length).toBe(MAX_LINK_LENGTH + 1);

            openLink(link);
            const opened = getOpenedHref();

            expect(opened).not.toContain('e=');
            expect(opened).toContain('id=abc');
        });

        it('result is shorter than the original', () => {
            const link = `tc://?v=2&id=abc&r=req&e=${longE}`;
            openLink(link);
            expect(getOpenedHref().length).toBeLessThan(link.length);
        });
    });
});
