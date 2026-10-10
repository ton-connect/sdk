'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveTarget, buildStubs } = require('./docs-redirect-stubs');

const BASE = 'https://docs.ton-connect.io/sdk/';

test('keeps a page that still exists', () => {
    const fresh = new Set(['classes/_tonconnect_sdk.TonConnect.html']);
    assert.equal(resolveTarget('classes/_tonconnect_sdk.TonConnect.html', fresh), 'classes/_tonconnect_sdk.TonConnect.html');
});

test('follows a renamed module prefix', () => {
    const fresh = new Set(['classes/_tonconnect_sdk.TonConnect.html']);
    assert.equal(resolveTarget('classes/_tonconnect_ui.TonConnect.html', fresh), 'classes/_tonconnect_sdk.TonConnect.html');
});

test('falls back to the docs root', () => {
    assert.equal(resolveTarget('classes/_tonconnect_ui.Gone.html', new Set(['index.html'])), '');
});

test('index pages point at their directory', () => {
    assert.equal(resolveTarget('index.html', new Set(['index.html'])), '');
});

test('stubs keep the anchor and cover old, fresh and 404 paths', () => {
    const stubs = buildStubs({
        oldPaths: ['classes/_tonconnect_ui.TonConnect.html'],
        freshPaths: ['classes/_tonconnect_sdk.TonConnect.html', 'index.html'],
        baseUrl: BASE
    });
    assert.match(
        stubs.get('classes/_tonconnect_ui.TonConnect.html'),
        /location\.replace\("https:\/\/docs\.ton-connect\.io\/sdk\/classes\/_tonconnect_sdk\.TonConnect\.html" \+ location\.hash\)/
    );
    assert.ok(stubs.get('index.html').includes('location.replace("https://docs.ton-connect.io/sdk/" + location.hash)'));
    assert.ok(stubs.has('classes/_tonconnect_sdk.TonConnect.html'));
    assert.ok(stubs.has('404.html'));
});
