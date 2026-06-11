/**
 * Mock browser-extension wallet for reproducing the "session lost on reload" race.
 *
 * Simulates a wallet extension that injects its JS bridge (window.<key>.tonconnect)
 * with a configurable delay — exactly like a real MV3 content script that runs
 * after the dapp bundle has already started.
 *
 * Usage:
 *   ?inject_delay=0     - inject synchronously, before the app bundle (control case, restore works)
 *   ?inject_delay=1500  - inject 1500ms after page start (bug case: TonConnect's
 *                         restoreConnection runs first, InjectedProvider constructor throws
 *                         WalletNotInjectedError and the SDK wipes the stored session)
 *
 * The delay persists in localStorage, so a plain F5 keeps the current mode.
 * The panel at the bottom-left shows a timeline of: injection moment, every
 * read/write/remove of the TonConnect session key, and current state.
 */
(function () {
    'use strict';

    var JS_BRIDGE_KEY = 'mocktonwallet';
    var STATE_KEY = 'mock-wallet-extension_connected';
    var DELAY_KEY = 'mock-wallet-extension_inject-delay';
    var EVENT_ID_KEY = 'mock-wallet-extension_event-id';
    var TC_STORAGE_KEY = 'ton-connect-storage_bridge-connection';

    /* ------------------------------------------------------------------ */
    /* Delay resolution: query param overrides and persists, default 0     */
    /* ------------------------------------------------------------------ */
    var params = new URLSearchParams(location.search);
    var delay;
    if (params.has('inject_delay')) {
        delay = Math.max(0, parseInt(params.get('inject_delay'), 10) || 0);
        try {
            localStorage.setItem(DELAY_KEY, String(delay));
        } catch (e) {
            /* ignore */
        }
    } else {
        delay = parseInt(localStorage.getItem(DELAY_KEY) || '0', 10) || 0;
    }

    /* ------------------------------------------------------------------ */
    /* Logging + panel                                                     */
    /* ------------------------------------------------------------------ */
    var t0 = performance.now();
    var logLines = [];

    function ts() {
        return String(Math.round(performance.now() - t0)).padStart(5, ' ') + 'ms';
    }

    function truncate(v) {
        v = String(v);
        return v.length > 80 ? v.slice(0, 80) + '…' : v;
    }

    function log(msg) {
        var line = '[' + ts() + '] ' + msg;
        logLines.push(line);
        // eslint-disable-next-line no-console
        console.log('%c[mock-wallet]%c ' + line, 'color:#a78bfa;font-weight:bold', '');
        schedulePanelRender();
    }

    /* ------------------------------------------------------------------ */
    /* Spy on the TonConnect session storage key                           */
    /* ------------------------------------------------------------------ */
    var origSetItem = Storage.prototype.setItem;
    var origRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (k, v) {
        if (k === TC_STORAGE_KEY) {
            log('setItem(bridge-connection) ← ' + truncate(v));
        }
        return origSetItem.apply(this, arguments);
    };
    Storage.prototype.removeItem = function (k) {
        if (k === TC_STORAGE_KEY) {
            log('🔥 removeItem(bridge-connection) — SDK wiped the stored session HERE');
        }
        return origRemoveItem.apply(this, arguments);
    };

    /* ------------------------------------------------------------------ */
    /* Mock wallet implementation (InjectedWalletApi)                      */
    /* ------------------------------------------------------------------ */
    var listeners = [];

    function nextEventId() {
        var id = parseInt(localStorage.getItem(EVENT_ID_KEY) || '0', 10) + 1;
        origSetItem.call(localStorage, EVENT_ID_KEY, String(id));
        return id;
    }

    function deviceInfo() {
        return {
            platform: 'browser',
            appName: 'mock-wallet',
            appVersion: '1.0.0',
            maxProtocolVersion: 2,
            features: [
                'SendTransaction',
                { name: 'SendTransaction', maxMessages: 4, extraCurrencySupported: false },
                { name: 'SignData', types: ['text', 'binary', 'cell'] }
            ]
        };
    }

    function connectItems(requestItems) {
        var items = [
            {
                name: 'ton_addr',
                address: '0:' + '11'.repeat(32),
                network: '-239',
                publicKey: '22'.repeat(32),
                walletStateInit: 'te6ccgEBAQEAAgAAAA=='
            }
        ];
        (requestItems || []).forEach(function (item) {
            if (item && item.name === 'ton_proof') {
                items.push({
                    name: 'ton_proof',
                    error: { code: 400, message: 'ton_proof is not supported by mock wallet' }
                });
            }
        });
        return items;
    }

    function connectEventSuccess(requestItems) {
        return {
            event: 'connect',
            id: nextEventId(),
            payload: {
                items: connectItems(requestItems),
                device: deviceInfo()
            }
        };
    }

    function isConnected() {
        return localStorage.getItem(STATE_KEY) === 'true';
    }

    function setConnected(value) {
        origSetItem.call(localStorage, STATE_KEY, String(value));
    }

    function emit(event) {
        listeners.forEach(function (cb) {
            try {
                cb(event);
            } catch (e) {
                /* ignore */
            }
        });
    }

    var tonconnect = {
        deviceInfo: deviceInfo(),
        protocolVersion: 2,
        isWalletBrowser: false,
        walletInfo: {
            name: 'Mock Wallet',
            app_name: 'mock-wallet',
            image: location.origin + '/ton.png',
            about_url: 'https://example.com/mock-wallet',
            platforms: ['chrome', 'firefox', 'safari']
        },

        connect: function (protocolVersion, message) {
            log('wallet.connect() called by dapp');
            setConnected(true);
            return Promise.resolve(connectEventSuccess(message && message.items));
        },

        restoreConnection: function () {
            log('wallet.restoreConnection() called by dapp → ' + (isConnected() ? 'connect' : 'connect_error'));
            if (isConnected()) {
                return Promise.resolve(connectEventSuccess());
            }
            return Promise.resolve({
                event: 'connect_error',
                id: nextEventId(),
                payload: { code: 100, message: 'Unknown app' }
            });
        },

        send: function (message) {
            log('wallet.send(' + message.method + ')');
            if (message.method === 'disconnect') {
                setConnected(false);
                return Promise.resolve({ result: {}, id: message.id });
            }
            return Promise.resolve({
                error: { code: 400, message: 'Method "' + message.method + '" is not supported by mock wallet' },
                id: message.id
            });
        },

        listen: function (callback) {
            listeners.push(callback);
            return function () {
                var i = listeners.indexOf(callback);
                if (i !== -1) listeners.splice(i, 1);
            };
        },

        disconnect: function () {
            log('wallet.disconnect()');
            setConnected(false);
            emit({ event: 'disconnect', id: nextEventId(), payload: {} });
        }
    };

    /* ------------------------------------------------------------------ */
    /* Injection with configurable delay                                   */
    /* ------------------------------------------------------------------ */
    var injected = false;

    function inject() {
        window[JS_BRIDGE_KEY] = { tonconnect: tonconnect };
        injected = true;
        log('💉 injected window.' + JS_BRIDGE_KEY + ' (delay=' + delay + 'ms)');
    }

    log('mock extension script evaluated, inject_delay=' + delay + 'ms, wallet state: ' + (isConnected() ? 'connected' : 'not connected') + ', stored tc session: ' + (localStorage.getItem(TC_STORAGE_KEY) ? 'present' : 'absent'));

    if (delay === 0) {
        inject(); // synchronous: guaranteed to beat the app bundle (control case)
    } else {
        setTimeout(inject, delay);
    }

    /* ------------------------------------------------------------------ */
    /* Repro panel                                                         */
    /* ------------------------------------------------------------------ */
    var panel = null;
    var renderScheduled = false;

    function schedulePanelRender() {
        if (renderScheduled) return;
        renderScheduled = true;
        setTimeout(function () {
            renderScheduled = false;
            renderPanel();
        }, 50);
    }

    function setDelayAndReload(ms) {
        origSetItem.call(localStorage, DELAY_KEY, String(ms));
        var url = new URL(location.href);
        url.searchParams.delete('inject_delay');
        location.href = url.toString();
    }

    function buildPanel() {
        panel = document.createElement('div');
        panel.id = 'mock-wallet-panel';
        panel.style.cssText =
            'position:fixed;bottom:8px;left:8px;z-index:2147483647;width:480px;max-height:45vh;' +
            'background:#16121f;color:#d6cfee;border:1px solid #5b21b6;border-radius:8px;' +
            'font:11px/1.5 ui-monospace,Menlo,monospace;padding:8px 10px;overflow:auto;' +
            'box-shadow:0 4px 24px rgba(0,0,0,.5)';
        document.body.appendChild(panel);
    }

    function renderPanel() {
        if (!document.body) return;
        if (!panel) buildPanel();

        var sessionStored = !!localStorage.getItem(TC_STORAGE_KEY);
        var status =
            '<b style="color:#a78bfa">MOCK WALLET EXTENSION</b> &nbsp; key=<code>' + JS_BRIDGE_KEY + '</code><br>' +
            'inject delay: <b>' + delay + 'ms</b> &nbsp; injected: <b style="color:' + (injected ? '#4ade80' : '#f87171') + '">' + injected + '</b> &nbsp; ' +
            'wallet side: <b style="color:' + (isConnected() ? '#4ade80' : '#f87171') + '">' + (isConnected() ? 'connected' : 'not connected') + '</b> &nbsp; ' +
            'tc session in storage: <b style="color:' + (sessionStored ? '#4ade80' : '#f87171') + '">' + (sessionStored ? 'present' : 'ABSENT') + '</b>';

        var buttons =
            '<div style="margin:6px 0">' +
            'reload with delay: ' +
            [0, 300, 1000, 3000]
                .map(function (ms) {
                    return '<button data-delay="' + ms + '" style="margin-right:4px;background:' + (ms === delay ? '#5b21b6' : '#2d2440') + ';color:#fff;border:1px solid #5b21b6;border-radius:4px;padding:1px 8px;cursor:pointer">' + ms + 'ms</button>';
                })
                .join('') +
            '<button data-seed="1" style="margin-left:8px;background:#14532d;color:#fff;border:1px solid #16a34a;border-radius:4px;padding:1px 8px;cursor:pointer">seed mock session</button>' +
            '<button data-reset="1" style="margin-left:8px;background:#7f1d1d;color:#fff;border:1px solid #b91c1c;border-radius:4px;padding:1px 8px;cursor:pointer">reset all</button>' +
            '</div>';

        panel.innerHTML =
            status + buttons + '<pre style="margin:0;white-space:pre-wrap">' + logLines.join('\n') + '</pre>';

        panel.querySelectorAll('button[data-delay]').forEach(function (btn) {
            btn.onclick = function () {
                setDelayAndReload(parseInt(btn.getAttribute('data-delay'), 10));
            };
        });
        var seedBtn = panel.querySelector('button[data-seed]');
        if (seedBtn) {
            seedBtn.onclick = function () {
                // emulate "wallet was connected before reload": wallet-side flag +
                // a stored TonConnect injected session pointing to the mock bridge key
                setConnected(true);
                origSetItem.call(
                    localStorage,
                    TC_STORAGE_KEY,
                    JSON.stringify({ type: 'injected', jsBridgeKey: JS_BRIDGE_KEY, nextRpcRequestId: 0 })
                );
                location.reload();
            };
        }
        var resetBtn = panel.querySelector('button[data-reset]');
        if (resetBtn) {
            resetBtn.onclick = function () {
                Object.keys(localStorage)
                    .filter(function (k) {
                        return k.indexOf('ton-connect') === 0 || k.indexOf('mock-wallet-extension') === 0;
                    })
                    .forEach(function (k) {
                        origRemoveItem.call(localStorage, k);
                    });
                location.reload();
            };
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderPanel);
    } else {
        renderPanel();
    }
    setInterval(renderPanel, 1000); // keep status fresh
})();
