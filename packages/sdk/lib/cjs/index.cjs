'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var protocol = require('@tonconnect/protocol');
require('@tonconnect/isomorphic-eventsource');
require('@tonconnect/isomorphic-fetch');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * Base class for TonConnect errors. You can check if the error was triggered by the @tonconnect/sdk using `err instanceof TonConnectError`.
 */
class TonConnectError extends Error {
    constructor(message, options) {
        super(message, options);
        this.message = `${TonConnectError.prefix} ${this.constructor.name}${this.info ? ': ' + this.info : ''}${message ? '\n' + message : ''}`;
        Object.setPrototypeOf(this, TonConnectError.prototype);
    }
    get info() {
        return '';
    }
}
TonConnectError.prefix = '[TON_CONNECT_SDK_ERROR]';

/**
 * Thrown when passed DappMetadata is in incorrect format.
 */
class DappMetadataError extends TonConnectError {
    get info() {
        return 'Passed DappMetadata is in incorrect format.';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, DappMetadataError.prototype);
    }
}

/**
 * Thrown when passed manifest contains errors.
 */
class ManifestContentErrorError extends TonConnectError {
    get info() {
        return 'Passed `tonconnect-manifest.json` contains errors. Check format of your manifest. See more https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, ManifestContentErrorError.prototype);
    }
}

/**
 * Thrown when wallet can't get manifest by passed manifestUrl.
 */
class ManifestNotFoundError extends TonConnectError {
    get info() {
        return 'Manifest not found. Make sure you added `tonconnect-manifest.json` to the root of your app or passed correct manifestUrl. See more https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, ManifestNotFoundError.prototype);
    }
}

/**
 * Thrown when wallet connection called but wallet already connected. To avoid the error, disconnect the wallet before doing a new connection.
 */
class WalletAlreadyConnectedError extends TonConnectError {
    get info() {
        return 'Wallet connection called but wallet already connected. To avoid the error, disconnect the wallet before doing a new connection.';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, WalletAlreadyConnectedError.prototype);
    }
}

/**
 * Thrown when send transaction or other protocol methods called while wallet is not connected.
 */
class WalletNotConnectedError extends TonConnectError {
    get info() {
        return 'Send transaction or other protocol methods called while wallet is not connected.';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, WalletNotConnectedError.prototype);
    }
}

function isWalletConnectionSourceJS(value) {
    return 'jsBridgeKey' in value;
}

/**
 * Thrown when user rejects the action in the wallet.
 */
class UserRejectsError extends TonConnectError {
    get info() {
        return 'User rejects the action in the wallet.';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, UserRejectsError.prototype);
    }
}

/**
 * Thrown when request to the wallet contains errors.
 */
class BadRequestError extends TonConnectError {
    get info() {
        return 'Request to the wallet contains errors.';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

/**
 * Thrown when app tries to send rpc request to the injected wallet while not connected.
 */
class UnknownAppError extends TonConnectError {
    get info() {
        return 'App tries to send rpc request to the injected wallet while not connected.';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, UnknownAppError.prototype);
    }
}

/**
 * Thrown when there is an attempt to connect to the injected wallet while it is not exists in the webpage.
 */
class WalletNotInjectedError extends TonConnectError {
    get info() {
        return 'There is an attempt to connect to the injected wallet while it is not exists in the webpage.';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, WalletNotInjectedError.prototype);
    }
}

/**
 * Thrown when `Storage` was not specified in the `DappMetadata` and default `localStorage` was not detected in the environment.
 */
class LocalstorageNotFoundError extends TonConnectError {
    get info() {
        return 'Storage was not specified in the `DappMetadata` and default `localStorage` was not detected in the environment.';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, LocalstorageNotFoundError.prototype);
    }
}

/**
 * Thrown when an error occurred while fetching the wallets list.
 */
class FetchWalletsError extends TonConnectError {
    get info() {
        return 'An error occurred while fetching the wallets list.';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, FetchWalletsError.prototype);
    }
}

/**
 * Thrown when passed address is in incorrect format.
 */
class WrongAddressError extends TonConnectError {
    get info() {
        return 'Passed address is in incorrect format.';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, WrongAddressError.prototype);
    }
}

/**
 * Thrown when passed hex is in incorrect format.
 */
class ParseHexError extends TonConnectError {
    get info() {
        return 'Passed hex is in incorrect format.';
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, ParseHexError.prototype);
    }
}

/**
 * Unhanded unknown error.
 */
class UnknownError extends TonConnectError {
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, UnknownError.prototype);
    }
}

const connectEventErrorsCodes = {
    [protocol.CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [protocol.CONNECT_EVENT_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [protocol.CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [protocol.CONNECT_EVENT_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError,
    [protocol.CONNECT_EVENT_ERROR_CODES.MANIFEST_NOT_FOUND_ERROR]: ManifestNotFoundError,
    [protocol.CONNECT_EVENT_ERROR_CODES.MANIFEST_CONTENT_ERROR]: ManifestContentErrorError
};
class ConnectErrorsParser {
    parseError(error) {
        let ErrorConstructor = UnknownError;
        if (error.code in connectEventErrorsCodes) {
            ErrorConstructor = connectEventErrorsCodes[error.code] || UnknownError;
        }
        return new ErrorConstructor(error.message);
    }
}
const connectErrorsParser = new ConnectErrorsParser();

class RpcParser {
    isError(response) {
        return 'error' in response;
    }
}

const sendTransactionErrors = {
    [protocol.SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [protocol.SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [protocol.SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [protocol.SEND_TRANSACTION_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
};
class SendTransactionParser extends RpcParser {
    convertToRpcRequest(request) {
        return {
            method: 'sendTransaction',
            params: [JSON.stringify(request)]
        };
    }
    parseAndThrowError(response) {
        let ErrorConstructor = UnknownError;
        if (response.error.code in sendTransactionErrors) {
            ErrorConstructor = sendTransactionErrors[response.error.code] || UnknownError;
        }
        throw new ErrorConstructor(response.error.message);
    }
    convertFromRpcResponse(rpcResponse) {
        return {
            boc: rpcResponse.result
        };
    }
}
const sendTransactionParser = new SendTransactionParser();

class HttpBridgeGatewayStorage {
    constructor(storage, bridgeUrl) {
        this.storage = storage;
        this.storeKey = 'ton-connect-storage_http-bridge-gateway::' + bridgeUrl;
    }
    storeLastEventId(lastEventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.setItem(this.storeKey, lastEventId);
        });
    }
    removeLastEventId() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.removeItem(this.storeKey);
        });
    }
    getLastEventId() {
        return __awaiter(this, void 0, void 0, function* () {
            const stored = yield this.storage.getItem(this.storeKey);
            if (!stored) {
                return null;
            }
            return stored;
        });
    }
}

function removeUrlLastSlash(url) {
    if (url.slice(-1) === '/') {
        return url.slice(0, -1);
    }
    return url;
}
function addPathToUrl(url, path) {
    return removeUrlLastSlash(url) + '/' + path;
}
function isTelegramUrl(link) {
    const url = new URL(link);
    return url.protocol === 'tg:' || url.hostname === 't.me';
}
function encodeTelegramUrlParameters(parameters) {
    return parameters
        .replaceAll('.', '%2E')
        .replaceAll('-', '%2D')
        .replaceAll('_', '%5F')
        .replaceAll('&', '-')
        .replaceAll('=', '__')
        .replaceAll('%', '--');
}

class BridgeGateway {
    constructor(storage, bridgeUrl, sessionId, listener, errorsListener) {
        this.bridgeUrl = bridgeUrl;
        this.sessionId = sessionId;
        this.listener = listener;
        this.errorsListener = errorsListener;
        this.ssePath = 'events';
        this.postPath = 'message';
        this.heartbeatMessage = 'heartbeat';
        this.defaultTtl = 300;
        this.isClosed = false;
        this.bridgeGatewayStorage = new HttpBridgeGatewayStorage(storage, bridgeUrl);
    }
    registerSession() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = new URL(addPathToUrl(this.bridgeUrl, this.ssePath));
            url.searchParams.append('client_id', this.sessionId);
            const lastEventId = yield this.bridgeGatewayStorage.getLastEventId();
            if (this.isClosed) {
                return;
            }
            if (lastEventId) {
                url.searchParams.append('last_event_id', lastEventId);
            }
            this.eventSource = new EventSource(url.toString());
            return new Promise((resolve, reject) => {
                this.eventSource.onerror = reject;
                this.eventSource.onopen = () => {
                    this.eventSource.onerror = this.errorsHandler.bind(this);
                    this.eventSource.onmessage = this.messagesHandler.bind(this);
                    resolve();
                };
            });
        });
    }
    send(message, receiver, topic, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = new URL(addPathToUrl(this.bridgeUrl, this.postPath));
            url.searchParams.append('client_id', this.sessionId);
            url.searchParams.append('to', receiver);
            url.searchParams.append('ttl', (ttl || this.defaultTtl).toString());
            url.searchParams.append('topic', topic);
            yield fetch(url, {
                method: 'post',
                body: protocol.Base64.encode(message)
            });
        });
    }
    pause() {
        var _a;
        (_a = this.eventSource) === null || _a === void 0 ? void 0 : _a.close();
    }
    unPause() {
        return this.registerSession();
    }
    close() {
        var _a;
        this.isClosed = true;
        (_a = this.eventSource) === null || _a === void 0 ? void 0 : _a.close();
    }
    setListener(listener) {
        this.listener = listener;
    }
    setErrorsListener(errorsListener) {
        this.errorsListener = errorsListener;
    }
    errorsHandler(e) {
        var _a, _b;
        if (!this.isClosed) {
            if (((_a = this.eventSource) === null || _a === void 0 ? void 0 : _a.readyState) === EventSource.CLOSED) {
                this.eventSource.close();
                this.registerSession();
                return;
            }
            if (((_b = this.eventSource) === null || _b === void 0 ? void 0 : _b.readyState) === EventSource.CONNECTING) {
                console.debug('[TON_CONNET_SDK_ERROR]: Bridge error', JSON.stringify(e));
                return;
            }
            this.errorsListener(e);
        }
    }
    messagesHandler(e) {
        return __awaiter(this, void 0, void 0, function* () {
            if (e.data === this.heartbeatMessage) {
                return;
            }
            yield this.bridgeGatewayStorage.storeLastEventId(e.lastEventId);
            if (!this.isClosed) {
                let bridgeIncomingMessage;
                try {
                    bridgeIncomingMessage = JSON.parse(e.data);
                }
                catch (e) {
                    throw new TonConnectError(`Bridge message parse failed, message ${e.data}`);
                }
                this.listener(bridgeIncomingMessage);
            }
        });
    }
}

function isPendingConnectionHttp(connection) {
    return !('connectEvent' in connection);
}

class BridgeConnectionStorage {
    constructor(storage) {
        this.storage = storage;
        this.storeKey = 'ton-connect-storage_bridge-connection';
    }
    storeConnection(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (connection.type === 'injected') {
                return this.storage.setItem(this.storeKey, JSON.stringify(connection));
            }
            if (!isPendingConnectionHttp(connection)) {
                const rawSession = {
                    sessionKeyPair: connection.session.sessionCrypto.stringifyKeypair(),
                    walletPublicKey: connection.session.walletPublicKey,
                    bridgeUrl: connection.session.bridgeUrl
                };
                const rawConnection = {
                    type: 'http',
                    connectEvent: connection.connectEvent,
                    session: rawSession,
                    lastWalletEventId: connection.lastWalletEventId,
                    nextRpcRequestId: connection.nextRpcRequestId
                };
                return this.storage.setItem(this.storeKey, JSON.stringify(rawConnection));
            }
            const rawConnection = {
                type: 'http',
                connectionSource: connection.connectionSource,
                sessionCrypto: connection.sessionCrypto.stringifyKeypair()
            };
            return this.storage.setItem(this.storeKey, JSON.stringify(rawConnection));
        });
    }
    removeConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storage.removeItem(this.storeKey);
        });
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const stored = yield this.storage.getItem(this.storeKey);
            if (!stored) {
                return null;
            }
            const connection = JSON.parse(stored);
            if (connection.type === 'injected') {
                return connection;
            }
            if ('connectEvent' in connection) {
                const sessionCrypto = new protocol.SessionCrypto(connection.session.sessionKeyPair);
                return {
                    type: 'http',
                    connectEvent: connection.connectEvent,
                    lastWalletEventId: connection.lastWalletEventId,
                    nextRpcRequestId: connection.nextRpcRequestId,
                    session: {
                        sessionCrypto,
                        bridgeUrl: connection.session.bridgeUrl,
                        walletPublicKey: connection.session.walletPublicKey
                    }
                };
            }
            return {
                type: 'http',
                sessionCrypto: new protocol.SessionCrypto(connection.sessionCrypto),
                connectionSource: connection.connectionSource
            };
        });
    }
    getHttpConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            if (!connection) {
                throw new TonConnectError('Trying to read HTTP connection source while nothing is stored');
            }
            if (connection.type === 'injected') {
                throw new TonConnectError('Trying to read HTTP connection source while injected connection is stored');
            }
            return connection;
        });
    }
    getHttpPendingConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            if (!connection) {
                throw new TonConnectError('Trying to read HTTP connection source while nothing is stored');
            }
            if (connection.type === 'injected') {
                throw new TonConnectError('Trying to read HTTP connection source while injected connection is stored');
            }
            if (!isPendingConnectionHttp(connection)) {
                throw new TonConnectError('Trying to read HTTP-pending connection while http connection is stored');
            }
            return connection;
        });
    }
    getInjectedConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            if (!connection) {
                throw new TonConnectError('Trying to read Injected bridge connection source while nothing is stored');
            }
            if ((connection === null || connection === void 0 ? void 0 : connection.type) === 'http') {
                throw new TonConnectError('Trying to read Injected bridge connection source while HTTP connection is stored');
            }
            return connection;
        });
    }
    storedConnectionType() {
        return __awaiter(this, void 0, void 0, function* () {
            const stored = yield this.storage.getItem(this.storeKey);
            if (!stored) {
                return null;
            }
            const connection = JSON.parse(stored);
            return connection.type;
        });
    }
    storeLastWalletEventId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            if (connection && connection.type === 'http' && !isPendingConnectionHttp(connection)) {
                connection.lastWalletEventId = id;
                return this.storeConnection(connection);
            }
        });
    }
    getLastWalletEventId() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            if (connection && 'lastWalletEventId' in connection) {
                return connection.lastWalletEventId;
            }
            return undefined;
        });
    }
    increaseNextRpcRequestId() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            if (connection && 'nextRpcRequestId' in connection) {
                const lastId = connection.nextRpcRequestId || 0;
                connection.nextRpcRequestId = lastId + 1;
                return this.storeConnection(connection);
            }
        });
    }
    getNextRpcRequestId() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            if (connection && 'nextRpcRequestId' in connection) {
                return connection.nextRpcRequestId || 0;
            }
            return 0;
        });
    }
}

const PROTOCOL_VERSION = 2;

function logDebug(...args) {
    {
        try {
            console.debug('[TON_CONNECT_SDK]', ...args);
        }
        catch (_a) { }
    }
}
function logError(...args) {
    {
        try {
            console.error('[TON_CONNECT_SDK]', ...args);
        }
        catch (_a) { }
    }
}
function logWarning(...args) {
    {
        try {
            console.warn('[TON_CONNECT_SDK]', ...args);
        }
        catch (_a) { }
    }
}

class BridgeProvider {
    constructor(storage, walletConnectionSource) {
        this.storage = storage;
        this.walletConnectionSource = walletConnectionSource;
        this.type = 'http';
        this.standardUniversalLink = 'tc://';
        this.pendingRequests = new Map();
        this.session = null;
        this.gateway = null;
        this.pendingGateways = [];
        this.listeners = [];
        this.connectionStorage = new BridgeConnectionStorage(storage);
    }
    static fromStorage(storage) {
        return __awaiter(this, void 0, void 0, function* () {
            const bridgeConnectionStorage = new BridgeConnectionStorage(storage);
            const connection = yield bridgeConnectionStorage.getHttpConnection();
            if (isPendingConnectionHttp(connection)) {
                return new BridgeProvider(storage, connection.connectionSource);
            }
            return new BridgeProvider(storage, { bridgeUrl: connection.session.bridgeUrl });
        });
    }
    connect(message) {
        this.closeGateways();
        const sessionCrypto = new protocol.SessionCrypto();
        this.session = {
            sessionCrypto,
            bridgeUrl: 'bridgeUrl' in this.walletConnectionSource
                ? this.walletConnectionSource.bridgeUrl
                : ''
        };
        this.connectionStorage
            .storeConnection({
            type: 'http',
            connectionSource: this.walletConnectionSource,
            sessionCrypto
        })
            .then(() => this.openGateways(sessionCrypto));
        const universalLink = 'universalLink' in this.walletConnectionSource &&
            this.walletConnectionSource.universalLink
            ? this.walletConnectionSource.universalLink
            : this.standardUniversalLink;
        return this.generateUniversalLink(universalLink, message);
    }
    restoreConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            this.closeGateways();
            const storedConnection = yield this.connectionStorage.getHttpConnection();
            if (!storedConnection) {
                return;
            }
            if (isPendingConnectionHttp(storedConnection)) {
                this.session = {
                    sessionCrypto: storedConnection.sessionCrypto,
                    bridgeUrl: 'bridgeUrl' in this.walletConnectionSource
                        ? this.walletConnectionSource.bridgeUrl
                        : ''
                };
                return this.openGateways(storedConnection.sessionCrypto);
            }
            if (Array.isArray(this.walletConnectionSource)) {
                throw new TonConnectError('Internal error. Connection source is array while WalletConnectionSourceHTTP was expected.');
            }
            this.session = storedConnection.session;
            this.gateway = new BridgeGateway(this.storage, this.walletConnectionSource.bridgeUrl, storedConnection.session.sessionCrypto.sessionId, this.gatewayListener.bind(this), this.gatewayErrorsListener.bind(this));
            yield this.gateway.registerSession();
            this.listeners.forEach(listener => listener(storedConnection.connectEvent));
        });
    }
    sendRequest(request, onRequestSent) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!this.gateway || !this.session || !('walletPublicKey' in this.session)) {
                throw new TonConnectError('Trying to send bridge request without session');
            }
            const id = (yield this.connectionStorage.getNextRpcRequestId()).toString();
            yield this.connectionStorage.increaseNextRpcRequestId();
            logDebug('Send http-bridge request:', Object.assign(Object.assign({}, request), { id }));
            const encodedRequest = this.session.sessionCrypto.encrypt(JSON.stringify(Object.assign(Object.assign({}, request), { id })), protocol.hexToByteArray(this.session.walletPublicKey));
            this.gateway
                .send(encodedRequest, this.session.walletPublicKey, request.method)
                .catch(reject);
            this.pendingRequests.set(id.toString(), resolve);
            onRequestSent === null || onRequestSent === void 0 ? void 0 : onRequestSent();
        }));
    }
    closeConnection() {
        this.closeGateways();
        this.listeners = [];
        this.session = null;
        this.gateway = null;
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                let called = false;
                const onRequestSent = () => {
                    called = true;
                    this.removeBridgeAndSession().then(resolve);
                };
                try {
                    yield this.sendRequest({ method: 'disconnect', params: [] }, onRequestSent);
                }
                catch (e) {
                    console.debug(e);
                    if (!called) {
                        this.removeBridgeAndSession().then(resolve);
                    }
                }
            }));
        });
    }
    listen(callback) {
        this.listeners.push(callback);
        return () => (this.listeners = this.listeners.filter(listener => listener !== callback));
    }
    pause() {
        var _a;
        (_a = this.gateway) === null || _a === void 0 ? void 0 : _a.pause();
        this.pendingGateways.forEach(bridge => bridge.pause());
    }
    unPause() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = this.pendingGateways.map(bridge => bridge.unPause());
            if (this.gateway) {
                promises.push(this.gateway.unPause());
            }
            yield Promise.all(promises);
        });
    }
    pendingGatewaysListener(gateway, bridgeUrl, bridgeIncomingMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.pendingGateways.includes(gateway)) {
                gateway.close();
                return;
            }
            this.closeGateways({ except: gateway });
            this.session.bridgeUrl = bridgeUrl;
            this.gateway = gateway;
            this.gateway.setErrorsListener(this.gatewayErrorsListener.bind(this));
            this.gateway.setListener(this.gatewayListener.bind(this));
            return this.gatewayListener(bridgeIncomingMessage);
        });
    }
    gatewayListener(bridgeIncomingMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletMessage = JSON.parse(this.session.sessionCrypto.decrypt(protocol.Base64.decode(bridgeIncomingMessage.message).toUint8Array(), protocol.hexToByteArray(bridgeIncomingMessage.from)));
            logDebug('Wallet message received:', walletMessage);
            if (!('event' in walletMessage)) {
                const id = walletMessage.id.toString();
                const resolve = this.pendingRequests.get(id);
                if (!resolve) {
                    logDebug(`Response id ${id} doesn't match any request's id`);
                    return;
                }
                resolve(walletMessage);
                this.pendingRequests.delete(id);
                return;
            }
            if (walletMessage.id !== undefined) {
                const lastId = yield this.connectionStorage.getLastWalletEventId();
                if (lastId !== undefined && walletMessage.id <= lastId) {
                    logError(`Received event id (=${walletMessage.id}) must be greater than stored last wallet event id (=${lastId}) `);
                    return;
                }
                if (walletMessage.event !== 'connect') {
                    yield this.connectionStorage.storeLastWalletEventId(walletMessage.id);
                }
            }
            // `this.listeners` might be modified in the event handler
            const listeners = this.listeners;
            if (walletMessage.event === 'connect') {
                yield this.updateSession(walletMessage, bridgeIncomingMessage.from);
            }
            if (walletMessage.event === 'disconnect') {
                yield this.removeBridgeAndSession();
            }
            listeners.forEach(listener => listener(walletMessage));
        });
    }
    gatewayErrorsListener(e) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new TonConnectError(`Bridge error ${JSON.stringify(e)}`);
        });
    }
    updateSession(connectEvent, walletPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            this.session = Object.assign(Object.assign({}, this.session), { walletPublicKey });
            const tonAddrItem = connectEvent.payload.items.find(item => item.name === 'ton_addr');
            const connectEventToSave = Object.assign(Object.assign({}, connectEvent), { payload: Object.assign(Object.assign({}, connectEvent.payload), { items: [tonAddrItem] }) });
            yield this.connectionStorage.storeConnection({
                type: 'http',
                session: this.session,
                lastWalletEventId: connectEvent.id,
                connectEvent: connectEventToSave,
                nextRpcRequestId: 0
            });
        });
    }
    removeBridgeAndSession() {
        return __awaiter(this, void 0, void 0, function* () {
            this.closeConnection();
            yield this.connectionStorage.removeConnection();
        });
    }
    generateUniversalLink(universalLink, message) {
        if (isTelegramUrl(universalLink)) {
            return this.generateTGUniversalLink(universalLink, message);
        }
        return this.generateRegularUniversalLink(universalLink, message);
    }
    generateRegularUniversalLink(universalLink, message) {
        const url = new URL(universalLink);
        url.searchParams.append('v', PROTOCOL_VERSION.toString());
        url.searchParams.append('id', this.session.sessionCrypto.sessionId);
        url.searchParams.append('r', JSON.stringify(message));
        return url.toString();
    }
    generateTGUniversalLink(universalLink, message) {
        const urlToWrap = this.generateRegularUniversalLink('about:blank', message);
        const linkParams = urlToWrap.split('?')[1];
        const startattach = 'tonconnect-' + encodeTelegramUrlParameters(linkParams);
        const url = new URL(universalLink);
        url.searchParams.append('startattach', startattach);
        return url.toString();
    }
    openGateways(sessionCrypto) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(this.walletConnectionSource)) {
                this.pendingGateways = this.walletConnectionSource.map(source => {
                    const gateway = new BridgeGateway(this.storage, source.bridgeUrl, sessionCrypto.sessionId, () => { }, e => {
                        console.error(e);
                    });
                    gateway.setListener(message => this.pendingGatewaysListener(gateway, source.bridgeUrl, message));
                    return gateway;
                });
                yield Promise.race(this.pendingGateways.map(bridge => bridge.registerSession()));
                return;
            }
            else {
                this.gateway = new BridgeGateway(this.storage, this.walletConnectionSource.bridgeUrl, sessionCrypto.sessionId, this.gatewayListener.bind(this), this.gatewayErrorsListener.bind(this));
                return this.gateway.registerSession();
            }
        });
    }
    closeGateways(options) {
        var _a;
        (_a = this.gateway) === null || _a === void 0 ? void 0 : _a.close();
        this.pendingGateways
            .filter(item => item !== (options === null || options === void 0 ? void 0 : options.except))
            .forEach(bridge => bridge.close());
        this.pendingGateways = [];
    }
}

function hasProperty(value, propertyKey) {
    return hasProperties(value, [propertyKey]);
}
function hasProperties(value, propertyKeys) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    return propertyKeys.every(propertyKey => propertyKey in value);
}

function isJSBridgeWithMetadata(value) {
    try {
        if (!hasProperty(value, 'tonconnect') || !hasProperty(value.tonconnect, 'walletInfo')) {
            return false;
        }
        return hasProperties(value.tonconnect.walletInfo, [
            'name',
            'app_name',
            'image',
            'about_url',
            'platforms'
        ]);
    }
    catch (_a) {
        return false;
    }
}

function getWindow() {
    if (typeof window === 'undefined') {
        return undefined;
    }
    return window;
}
function getDocument() {
    if (typeof document === 'undefined') {
        return undefined;
    }
    return document;
}
function getWebPageManifest() {
    var _a;
    const origin = (_a = getWindow()) === null || _a === void 0 ? void 0 : _a.location.origin;
    if (origin) {
        return origin + '/tonconnect-manifest.json';
    }
    return '';
}

class InjectedProvider {
    constructor(storage, injectedWalletKey) {
        this.injectedWalletKey = injectedWalletKey;
        this.type = 'injected';
        this.unsubscribeCallback = null;
        this.listenSubscriptions = false;
        this.listeners = [];
        const window = InjectedProvider.window;
        if (!InjectedProvider.isWindowContainsWallet(window, injectedWalletKey)) {
            throw new WalletNotInjectedError();
        }
        this.connectionStorage = new BridgeConnectionStorage(storage);
        this.injectedWallet = window[injectedWalletKey].tonconnect;
    }
    static fromStorage(storage) {
        return __awaiter(this, void 0, void 0, function* () {
            const bridgeConnectionStorage = new BridgeConnectionStorage(storage);
            const connection = yield bridgeConnectionStorage.getInjectedConnection();
            return new InjectedProvider(storage, connection.jsBridgeKey);
        });
    }
    static isWalletInjected(injectedWalletKey) {
        return InjectedProvider.isWindowContainsWallet(this.window, injectedWalletKey);
    }
    static isInsideWalletBrowser(injectedWalletKey) {
        if (InjectedProvider.isWindowContainsWallet(this.window, injectedWalletKey)) {
            return this.window[injectedWalletKey].tonconnect.isWalletBrowser;
        }
        return false;
    }
    static getCurrentlyInjectedWallets() {
        if (!this.window) {
            return [];
        }
        const wallets = Object.entries(this.window).filter(([_, value]) => isJSBridgeWithMetadata(value));
        return wallets.map(([jsBridgeKey, wallet]) => ({
            name: wallet.tonconnect.walletInfo.name,
            appName: wallet.tonconnect.walletInfo.app_name,
            aboutUrl: wallet.tonconnect.walletInfo.about_url,
            imageUrl: wallet.tonconnect.walletInfo.image,
            tondns: wallet.tonconnect.walletInfo.tondns,
            jsBridgeKey,
            injected: true,
            embedded: wallet.tonconnect.isWalletBrowser,
            platforms: wallet.tonconnect.walletInfo.platforms
        }));
    }
    static isWindowContainsWallet(window, injectedWalletKey) {
        return (!!window &&
            injectedWalletKey in window &&
            typeof window[injectedWalletKey] === 'object' &&
            'tonconnect' in window[injectedWalletKey]);
    }
    connect(message) {
        this._connect(PROTOCOL_VERSION, message);
    }
    restoreConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logDebug(`Injected Provider restoring connection...`);
                const connectEvent = yield this.injectedWallet.restoreConnection();
                logDebug('Injected Provider restoring connection response', connectEvent);
                if (connectEvent.event === 'connect') {
                    this.makeSubscriptions();
                    this.listeners.forEach(listener => listener(connectEvent));
                }
                else {
                    yield this.connectionStorage.removeConnection();
                }
            }
            catch (e) {
                yield this.connectionStorage.removeConnection();
                console.error(e);
            }
        });
    }
    closeConnection() {
        if (this.listenSubscriptions) {
            this.injectedWallet.disconnect();
        }
        this.closeAllListeners();
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                const onRequestSent = () => {
                    this.closeAllListeners();
                    this.connectionStorage.removeConnection().then(resolve);
                };
                try {
                    this.injectedWallet.disconnect();
                    onRequestSent();
                }
                catch (e) {
                    logDebug(e);
                    this.sendRequest({
                        method: 'disconnect',
                        params: []
                    }, onRequestSent);
                }
            });
        });
    }
    closeAllListeners() {
        var _a;
        this.listenSubscriptions = false;
        this.listeners = [];
        (_a = this.unsubscribeCallback) === null || _a === void 0 ? void 0 : _a.call(this);
    }
    listen(eventsCallback) {
        this.listeners.push(eventsCallback);
        return () => (this.listeners = this.listeners.filter(listener => listener !== eventsCallback));
    }
    sendRequest(request, onRequestSent) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = (yield this.connectionStorage.getNextRpcRequestId()).toString();
            yield this.connectionStorage.increaseNextRpcRequestId();
            logDebug('Send injected-bridge request:', Object.assign(Object.assign({}, request), { id }));
            const result = this.injectedWallet.send(Object.assign(Object.assign({}, request), { id }));
            result.then(response => logDebug('Wallet message received:', response));
            onRequestSent === null || onRequestSent === void 0 ? void 0 : onRequestSent();
            return result;
        });
    }
    _connect(protocolVersion, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logDebug(`Injected Provider connect request: protocolVersion: ${protocolVersion}, message:`, message);
                const connectEvent = yield this.injectedWallet.connect(protocolVersion, message);
                logDebug('Injected Provider connect response:', connectEvent);
                if (connectEvent.event === 'connect') {
                    yield this.updateSession();
                    this.makeSubscriptions();
                }
                this.listeners.forEach(listener => listener(connectEvent));
            }
            catch (e) {
                logDebug(e);
                const connectEventError = {
                    event: 'connect_error',
                    payload: {
                        code: 0,
                        message: e === null || e === void 0 ? void 0 : e.toString()
                    }
                };
                this.listeners.forEach(listener => listener(connectEventError));
            }
        });
    }
    makeSubscriptions() {
        this.listenSubscriptions = true;
        this.unsubscribeCallback = this.injectedWallet.listen(e => {
            logDebug('Wallet message received:', e);
            if (this.listenSubscriptions) {
                this.listeners.forEach(listener => listener(e));
            }
            if (e.event === 'disconnect') {
                this.disconnect();
            }
        });
    }
    updateSession() {
        return this.connectionStorage.storeConnection({
            type: 'injected',
            jsBridgeKey: this.injectedWalletKey,
            nextRpcRequestId: 0
        });
    }
}
InjectedProvider.window = getWindow();

class DefaultStorage {
    constructor() {
        const window = getWindow();
        if (!(window === null || window === void 0 ? void 0 : window.localStorage)) {
            throw new LocalstorageNotFoundError();
        }
        this.window = window;
    }
    getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(this.window.localStorage.getItem(key));
        });
    }
    removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.window.localStorage.removeItem(key);
            return Promise.resolve();
        });
    }
    setItem(key, value) {
        this.window.localStorage.setItem(key, value);
        return Promise.resolve();
    }
}

/**
 * Checks if `WalletInfo` is `WalletInfoInjectable` and `WalletInfo` is injected to the current webpage (`walletInfo.injected === true`).
 * @param value WalletInfo to check.
 */
function isWalletInfoCurrentlyInjected(value) {
    return isWalletInfoInjectable(value) && value.injected;
}
/**
 * Checks if `WalletInfo` is `WalletInfoInjectable` and dApp is opened inside this wallet's browser.
 * @param value WalletInfo to check.
 */
function isWalletInfoCurrentlyEmbedded(value) {
    return isWalletInfoCurrentlyInjected(value) && value.embedded;
}
/**
 * Checks if `WalletInfo` is `WalletInfoInjected`, but doesn't check if it is injected to the page or not.
 * @param value WalletInfo to check.
 */
function isWalletInfoInjectable(value) {
    return 'jsBridgeKey' in value;
}
/**
 * Checks if `WalletInfo` is `WalletInfoRemote`.
 * @param value WalletInfo to check.
 */
function isWalletInfoRemote(value) {
    return 'bridgeUrl' in value;
}
/**
 * @deprecated use `isWalletInfoInjectable` or `isWalletInfoCurrentlyInjected` instead.
 * @param value WalletInfo to check.
 */
function isWalletInfoInjected(value) {
    return 'jsBridgeKey' in value;
}

const FALLBACK_WALLETS_LIST = [
    {
        app_name: 'tonkeeper',
        name: 'Tonkeeper',
        image: 'https://tonkeeper.com/assets/tonconnect-icon.png',
        tondns: 'tonkeeper.ton',
        about_url: 'https://tonkeeper.com',
        universal_url: 'https://app.tonkeeper.com/ton-connect',
        bridge: [
            {
                type: 'sse',
                url: 'https://bridge.tonapi.io/bridge'
            },
            {
                type: 'js',
                key: 'tonkeeper'
            }
        ],
        platforms: ['ios', 'android', 'chrome', 'firefox']
    },
    {
        app_name: 'openmask',
        name: 'OpenMask',
        image: 'https://raw.githubusercontent.com/OpenProduct/openmask-extension/main/public/openmask-logo-288.png',
        about_url: 'https://www.openmask.app/',
        bridge: [
            {
                type: 'js',
                key: 'openmask'
            }
        ],
        platforms: ['chrome']
    },
    {
        app_name: 'mytonwallet',
        name: 'MyTonWallet',
        image: 'https://mytonwallet.io/icon-256.png',
        about_url: 'https://mytonwallet.io',
        universal_url: 'https://connect.mytonwallet.org',
        bridge: [
            {
                type: 'js',
                key: 'mytonwallet'
            },
            {
                type: 'sse',
                url: 'https://tonconnectbridge.mytonwallet.org/bridge/'
            }
        ],
        platforms: ['chrome', 'windows', 'macos', 'linux']
    },
    {
        app_name: 'tonhub',
        name: 'Tonhub',
        image: 'https://tonhub.com/tonconnect_logo.png',
        about_url: 'https://tonhub.com',
        universal_url: 'https://tonhub.com/ton-connect',
        bridge: [
            {
                type: 'js',
                key: 'tonhub'
            },
            {
                type: 'sse',
                url: 'https://connect.tonhubapi.com/tonconnect'
            }
        ],
        platforms: ['ios', 'android']
    },
    {
        app_name: 'tonflow',
        name: 'TonFlow',
        image: 'https://tonflow.net/assets/images/tonflow_ico_192.png',
        about_url: 'https://tonflow.net',
        bridge: [
            {
                type: 'js',
                key: 'tonflow'
            }
        ],
        platforms: ['chrome']
    },
    {
        app_name: 'dewallet',
        name: 'DeWallet',
        image: 'https://app.delabwallet.com/logo_black.png',
        about_url: 'https://delabwallet.com',
        bridge: [
            {
                type: 'js',
                key: 'dewallet'
            }
        ],
        platforms: ['chrome']
    },
    {
        app_name: 'xtonwallet',
        name: 'XTONWallet',
        image: 'https://xtonwallet.com/assets/img/icon-256-back.png',
        about_url: 'https://xtonwallet.com',
        bridge: [
            {
                type: 'js',
                key: 'xtonwallet'
            }
        ],
        platforms: ['chrome', 'firefox']
    },
    {
        app_name: 'tonwallet',
        name: 'TON Wallet',
        image: 'https://wallet.ton.org/assets/ui/qr-logo.png',
        about_url: 'https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd',
        bridge: [
            {
                type: 'js',
                key: 'tonwallet'
            }
        ],
        platforms: ['chrome']
    }
];

class WalletsListManager {
    constructor(options) {
        this.walletsListCache = null;
        this.walletsListCacheCreationTimestamp = null;
        this.walletsListSource = 'https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets.json';
        if (options === null || options === void 0 ? void 0 : options.walletsListSource) {
            this.walletsListSource = options.walletsListSource;
        }
        if (options === null || options === void 0 ? void 0 : options.cacheTTLMs) {
            this.cacheTTLMs = options.cacheTTLMs;
        }
    }
    getWallets() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cacheTTLMs &&
                this.walletsListCacheCreationTimestamp &&
                Date.now() > this.walletsListCacheCreationTimestamp + this.cacheTTLMs) {
                this.walletsListCache = null;
            }
            if (!this.walletsListCache) {
                this.walletsListCache = this.fetchWalletsList();
                this.walletsListCache
                    .then(() => {
                    this.walletsListCacheCreationTimestamp = Date.now();
                })
                    .catch(() => {
                    this.walletsListCache = null;
                    this.walletsListCacheCreationTimestamp = null;
                });
            }
            return this.walletsListCache;
        });
    }
    getEmbeddedWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            const walletsList = yield this.getWallets();
            const embeddedWallets = walletsList.filter(isWalletInfoCurrentlyEmbedded);
            if (embeddedWallets.length !== 1) {
                return null;
            }
            return embeddedWallets[0];
        });
    }
    fetchWalletsList() {
        return __awaiter(this, void 0, void 0, function* () {
            let walletsList = [];
            try {
                const walletsResponse = yield fetch(this.walletsListSource);
                walletsList = yield walletsResponse.json();
                if (!Array.isArray(walletsList)) {
                    throw new FetchWalletsError('Wrong wallets list format, wallets list must be an array.');
                }
                const wrongFormatWallets = walletsList.filter(wallet => !this.isCorrectWalletConfigDTO(wallet));
                if (wrongFormatWallets.length) {
                    logError(`Wallet(s) ${wrongFormatWallets
                        .map(wallet => wallet.name)
                        .join(', ')} config format is wrong. They were removed from the wallets list.`);
                    walletsList = walletsList.filter(wallet => this.isCorrectWalletConfigDTO(wallet));
                }
            }
            catch (e) {
                logError(e);
                walletsList = FALLBACK_WALLETS_LIST;
            }
            let currentlyInjectedWallets = [];
            try {
                currentlyInjectedWallets = InjectedProvider.getCurrentlyInjectedWallets();
            }
            catch (e) {
                logError(e);
            }
            return this.mergeWalletsLists(this.walletConfigDTOListToWalletConfigList(walletsList), currentlyInjectedWallets);
        });
    }
    walletConfigDTOListToWalletConfigList(walletConfigDTO) {
        return walletConfigDTO.map(walletConfigDTO => {
            const walletConfigBase = {
                name: walletConfigDTO.name,
                appName: walletConfigDTO.app_name,
                imageUrl: walletConfigDTO.image,
                aboutUrl: walletConfigDTO.about_url,
                tondns: walletConfigDTO.tondns,
                platforms: walletConfigDTO.platforms
            };
            const walletConfig = walletConfigBase;
            walletConfigDTO.bridge.forEach(bridge => {
                if (bridge.type === 'sse') {
                    walletConfig.bridgeUrl = bridge.url;
                    walletConfig.universalLink =
                        walletConfigDTO.universal_url;
                    walletConfig.deepLink = walletConfigDTO.deepLink;
                }
                if (bridge.type === 'js') {
                    const jsBridgeKey = bridge.key;
                    walletConfig.jsBridgeKey = jsBridgeKey;
                    walletConfig.injected =
                        InjectedProvider.isWalletInjected(jsBridgeKey);
                    walletConfig.embedded =
                        InjectedProvider.isInsideWalletBrowser(jsBridgeKey);
                }
            });
            return walletConfig;
        });
    }
    mergeWalletsLists(list1, list2) {
        const names = new Set(list1.concat(list2).map(item => item.name));
        return [...names.values()].map(name => {
            const list1Item = list1.find(item => item.name === name);
            const list2Item = list2.find(item => item.name === name);
            return Object.assign(Object.assign({}, (list1Item && Object.assign({}, list1Item))), (list2Item && Object.assign({}, list2Item)));
        });
    }
    // eslint-disable-next-line complexity
    isCorrectWalletConfigDTO(value) {
        if (!value || !(typeof value === 'object')) {
            return false;
        }
        const containsName = 'name' in value;
        const containsAppName = 'app_name' in value;
        const containsImage = 'image' in value;
        const containsAbout = 'about_url' in value;
        const containsPlatforms = 'platforms' in value;
        if (!containsName ||
            !containsImage ||
            !containsAbout ||
            !containsPlatforms ||
            !containsAppName) {
            return false;
        }
        if (!value.platforms ||
            !Array.isArray(value.platforms) ||
            !value.platforms.length) {
            return false;
        }
        if (!('bridge' in value) ||
            !Array.isArray(value.bridge) ||
            !value.bridge.length) {
            return false;
        }
        const bridge = value.bridge;
        if (bridge.some(item => !item || typeof item !== 'object' || !('type' in item))) {
            return false;
        }
        const sseBridge = bridge.find(item => item.type === 'sse');
        if (sseBridge) {
            if (!('url' in sseBridge) ||
                !sseBridge.url ||
                !value.universal_url) {
                return false;
            }
        }
        const jsBridge = bridge.find(item => item.type === 'js');
        if (jsBridge) {
            if (!('key' in jsBridge) || !jsBridge.key) {
                return false;
            }
        }
        return true;
    }
}

/**
 * Thrown when wallet doesn't support requested feature method.
 */
class WalletNotSupportFeatureError extends TonConnectError {
    get info() {
        return "Wallet doesn't support requested feature method.";
    }
    constructor(...args) {
        super(...args);
        Object.setPrototypeOf(this, WalletNotSupportFeatureError.prototype);
    }
}

function checkSendTransactionSupport(features, options) {
    const supportsDeprecatedSendTransactionFeature = features.includes('SendTransaction');
    const sendTransactionFeature = features.find(feature => feature && typeof feature === 'object' && feature.name === 'SendTransaction');
    if (!supportsDeprecatedSendTransactionFeature && !sendTransactionFeature) {
        throw new WalletNotSupportFeatureError("Wallet doesn't support SendTransaction feature.");
    }
    if (sendTransactionFeature && sendTransactionFeature.maxMessages !== undefined) {
        if (sendTransactionFeature.maxMessages < options.requiredMessagesNumber) {
            throw new WalletNotSupportFeatureError(`Wallet is not able to handle such SendTransaction request. Max support messages number is ${sendTransactionFeature.maxMessages}, but ${options.requiredMessagesNumber} is required.`);
        }
        return;
    }
    logWarning("Connected wallet didn't provide information about max allowed messages in the SendTransaction request. Request may be rejected by the wallet.");
}

class TonConnect {
    constructor(options) {
        this.walletsList = new WalletsListManager();
        this._wallet = null;
        this.provider = null;
        this.statusChangeSubscriptions = [];
        this.statusChangeErrorSubscriptions = [];
        this.dappSettings = {
            manifestUrl: (options === null || options === void 0 ? void 0 : options.manifestUrl) || getWebPageManifest(),
            storage: (options === null || options === void 0 ? void 0 : options.storage) || new DefaultStorage()
        };
        this.walletsList = new WalletsListManager({
            walletsListSource: options === null || options === void 0 ? void 0 : options.walletsListSource,
            cacheTTLMs: options === null || options === void 0 ? void 0 : options.walletsListCacheTTLMs
        });
        if (!this.dappSettings.manifestUrl) {
            throw new DappMetadataError('Dapp tonconnect-manifest.json must be specified if window.location.origin is undefined. See more https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest');
        }
        this.bridgeConnectionStorage = new BridgeConnectionStorage(this.dappSettings.storage);
        if (!(options === null || options === void 0 ? void 0 : options.disableAutoPauseConnection)) {
            this.addWindowFocusAndBlurSubscriptions();
        }
    }
    /**
     * Returns available wallets list.
     */
    static getWallets() {
        return this.walletsList.getWallets();
    }
    /**
     * Shows if the wallet is connected right now.
     */
    get connected() {
        return this._wallet !== null;
    }
    /**
     * Current connected account or null if no account is connected.
     */
    get account() {
        var _a;
        return ((_a = this._wallet) === null || _a === void 0 ? void 0 : _a.account) || null;
    }
    /**
     * Current connected wallet or null if no account is connected.
     */
    get wallet() {
        return this._wallet;
    }
    set wallet(value) {
        this._wallet = value;
        this.statusChangeSubscriptions.forEach(callback => callback(this._wallet));
    }
    /**
     * Returns available wallets list.
     */
    getWallets() {
        return this.walletsList.getWallets();
    }
    /**
     * Allows to subscribe to connection status changes and handle connection errors.
     * @param callback will be called after connections status changes with actual wallet or null.
     * @param errorsHandler (optional) will be called with some instance of TonConnectError when connect error is received.
     * @returns unsubscribe callback.
     */
    onStatusChange(callback, errorsHandler) {
        this.statusChangeSubscriptions.push(callback);
        if (errorsHandler) {
            this.statusChangeErrorSubscriptions.push(errorsHandler);
        }
        return () => {
            this.statusChangeSubscriptions = this.statusChangeSubscriptions.filter(item => item !== callback);
            if (errorsHandler) {
                this.statusChangeErrorSubscriptions = this.statusChangeErrorSubscriptions.filter(item => item !== errorsHandler);
            }
        };
    }
    connect(wallet, request) {
        var _a;
        if (this.connected) {
            throw new WalletAlreadyConnectedError();
        }
        (_a = this.provider) === null || _a === void 0 ? void 0 : _a.closeConnection();
        this.provider = this.createProvider(wallet);
        return this.provider.connect(this.createConnectRequest(request));
    }
    /**
     * Try to restore existing session and reconnect to the corresponding wallet. Call it immediately when your app is loaded.
     */
    restoreConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const [bridgeConnectionType, embeddedWallet] = yield Promise.all([
                this.bridgeConnectionStorage.storedConnectionType(),
                this.walletsList.getEmbeddedWallet()
            ]);
            try {
                switch (bridgeConnectionType) {
                    case 'http':
                        this.provider = yield BridgeProvider.fromStorage(this.dappSettings.storage);
                        break;
                    case 'injected':
                        this.provider = yield InjectedProvider.fromStorage(this.dappSettings.storage);
                        break;
                    default:
                        if (embeddedWallet) {
                            this.provider = yield this.createProvider(embeddedWallet);
                        }
                        else {
                            return;
                        }
                }
            }
            catch (_a) {
                yield this.bridgeConnectionStorage.removeConnection();
                this.provider = null;
                return;
            }
            this.provider.listen(this.walletEventsListener.bind(this));
            return this.provider.restoreConnection();
        });
    }
    /**
     * Asks connected wallet to sign and send the transaction.
     * @param transaction transaction to send.
     * @returns signed transaction boc that allows you to find the transaction in the blockchain.
     * If user rejects transaction, method will throw the corresponding error.
     */
    sendTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            checkSendTransactionSupport(this.wallet.device.features, {
                requiredMessagesNumber: transaction.messages.length
            });
            const { validUntil } = transaction, tx = __rest(transaction, ["validUntil"]);
            const from = transaction.from || this.account.address;
            const network = transaction.network || this.account.chain;
            const response = yield this.provider.sendRequest(sendTransactionParser.convertToRpcRequest(Object.assign(Object.assign({}, tx), { valid_until: validUntil, from,
                network })));
            if (sendTransactionParser.isError(response)) {
                return sendTransactionParser.parseAndThrowError(response);
            }
            return sendTransactionParser.convertFromRpcResponse(response);
        });
    }
    /**
     * Disconnect form thw connected wallet and drop current session.
     */
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connected) {
                throw new WalletNotConnectedError();
            }
            yield this.provider.disconnect();
            this.onWalletDisconnected();
        });
    }
    /**
     * Pause bridge HTTP connection. Might be helpful, if you want to pause connections while browser tab is unfocused,
     * or if you use SDK with NodeJS and want to save server resources.
     */
    pauseConnection() {
        var _a;
        if (((_a = this.provider) === null || _a === void 0 ? void 0 : _a.type) !== 'http') {
            return;
        }
        this.provider.pause();
    }
    /**
     * Unpause bridge HTTP connection if it is paused.
     */
    unPauseConnection() {
        var _a;
        if (((_a = this.provider) === null || _a === void 0 ? void 0 : _a.type) !== 'http') {
            return Promise.resolve();
        }
        return this.provider.unPause();
    }
    addWindowFocusAndBlurSubscriptions() {
        const document = getDocument();
        if (!document) {
            return;
        }
        try {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseConnection();
                }
                else {
                    this.unPauseConnection();
                }
            });
        }
        catch (e) {
            console.error('Cannot subscribe to the document.visibilitychange: ', e);
        }
    }
    createProvider(wallet) {
        let provider;
        if (!Array.isArray(wallet) && isWalletConnectionSourceJS(wallet)) {
            provider = new InjectedProvider(this.dappSettings.storage, wallet.jsBridgeKey);
        }
        else {
            provider = new BridgeProvider(this.dappSettings.storage, wallet);
        }
        provider.listen(this.walletEventsListener.bind(this));
        return provider;
    }
    walletEventsListener(e) {
        switch (e.event) {
            case 'connect':
                this.onWalletConnected(e.payload);
                break;
            case 'connect_error':
                this.onWalletConnectError(e.payload);
                break;
            case 'disconnect':
                this.onWalletDisconnected();
        }
    }
    onWalletConnected(connectEvent) {
        const tonAccountItem = connectEvent.items.find(item => item.name === 'ton_addr');
        const tonProofItem = connectEvent.items.find(item => item.name === 'ton_proof');
        if (!tonAccountItem) {
            throw new TonConnectError('ton_addr connection item was not found');
        }
        const wallet = {
            device: connectEvent.device,
            provider: this.provider.type,
            account: {
                address: tonAccountItem.address,
                chain: tonAccountItem.network,
                walletStateInit: tonAccountItem.walletStateInit,
                publicKey: tonAccountItem.publicKey
            }
        };
        if (tonProofItem) {
            wallet.connectItems = {
                tonProof: tonProofItem
            };
        }
        this.wallet = wallet;
    }
    onWalletConnectError(connectEventError) {
        const error = connectErrorsParser.parseError(connectEventError);
        this.statusChangeErrorSubscriptions.forEach(errorsHandler => errorsHandler(error));
        console.debug(error);
        if (error instanceof ManifestNotFoundError || error instanceof ManifestContentErrorError) {
            console.error(error);
            throw error;
        }
    }
    onWalletDisconnected() {
        this.wallet = null;
    }
    checkConnection() {
        if (!this.connected) {
            throw new WalletNotConnectedError();
        }
    }
    createConnectRequest(request) {
        const items = [
            {
                name: 'ton_addr'
            }
        ];
        if (request === null || request === void 0 ? void 0 : request.tonProof) {
            items.push({
                name: 'ton_proof',
                payload: request.tonProof
            });
        }
        return {
            manifestUrl: this.dappSettings.manifestUrl,
            items
        };
    }
}
TonConnect.walletsList = new WalletsListManager();
/**
 * Check if specified wallet is injected and available to use with the app.
 * @param walletJSKey target wallet's js bridge key.
 */
TonConnect.isWalletInjected = (walletJSKey) => InjectedProvider.isWalletInjected(walletJSKey);
/**
 * Check if the app is opened inside specified wallet's browser.
 * @param walletJSKey target wallet's js bridge key.
 */
TonConnect.isInsideWalletBrowser = (walletJSKey) => InjectedProvider.isInsideWalletBrowser(walletJSKey);

const bounceableTag = 0x11;
const testOnlyTag = 0x80;
/**
 * Converts raw TON address to bounceable user-friendly format. [See details]{@link https://ton.org/docs/learn/overviews/addresses#user-friendly-address}
 * @param hexAddress raw TON address formatted as "0:<hex string without 0x>".
 * @param [testOnly=false] convert address to test-only form. [See details]{@link https://ton.org/docs/learn/overviews/addresses#user-friendly-address}
 */
function toUserFriendlyAddress(hexAddress, testOnly = false) {
    const { wc, hex } = parseHexAddress(hexAddress);
    let tag = bounceableTag;
    if (testOnly) {
        tag |= testOnlyTag;
    }
    const addr = new Int8Array(34);
    addr[0] = tag;
    addr[1] = wc;
    addr.set(hex, 2);
    const addressWithChecksum = new Uint8Array(36);
    addressWithChecksum.set(addr);
    addressWithChecksum.set(crc16(addr), 34);
    let addressBase64 = protocol.Base64.encode(addressWithChecksum);
    return addressBase64.replace(/\+/g, '-').replace(/\//g, '_');
}
function parseHexAddress(hexAddress) {
    if (!hexAddress.includes(':')) {
        throw new WrongAddressError(`Wrong address ${hexAddress}. Address must include ":".`);
    }
    const parts = hexAddress.split(':');
    if (parts.length !== 2) {
        throw new WrongAddressError(`Wrong address ${hexAddress}. Address must include ":" only once.`);
    }
    const wc = parseInt(parts[0]);
    if (wc !== 0 && wc !== -1) {
        throw new WrongAddressError(`Wrong address ${hexAddress}. WC must be eq 0 or -1, but ${wc} received.`);
    }
    const hex = parts[1];
    if ((hex === null || hex === void 0 ? void 0 : hex.length) !== 64) {
        throw new WrongAddressError(`Wrong address ${hexAddress}. Hex part must be 64bytes length, but ${hex === null || hex === void 0 ? void 0 : hex.length} received.`);
    }
    return {
        wc,
        hex: hexToBytes(hex)
    };
}
function crc16(data) {
    const poly = 0x1021;
    let reg = 0;
    const message = new Uint8Array(data.length + 2);
    message.set(data);
    for (let byte of message) {
        let mask = 0x80;
        while (mask > 0) {
            reg <<= 1;
            if (byte & mask) {
                reg += 1;
            }
            mask >>= 1;
            if (reg > 0xffff) {
                reg &= 0xffff;
                reg ^= poly;
            }
        }
    }
    return new Uint8Array([Math.floor(reg / 256), reg % 256]);
}
const toByteMap = {};
for (let ord = 0; ord <= 0xff; ord++) {
    let s = ord.toString(16);
    if (s.length < 2) {
        s = '0' + s;
    }
    toByteMap[s] = ord;
}
function hexToBytes(hex) {
    hex = hex.toLowerCase();
    const length2 = hex.length;
    if (length2 % 2 !== 0) {
        throw new ParseHexError('Hex string must have length a multiple of 2: ' + hex);
    }
    const length = length2 / 2;
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        const doubled = i * 2;
        const hexSubstring = hex.substring(doubled, doubled + 2);
        if (!toByteMap.hasOwnProperty(hexSubstring)) {
            throw new ParseHexError('Invalid hex character: ' + hexSubstring);
        }
        result[i] = toByteMap[hexSubstring];
    }
    return result;
}

Object.defineProperty(exports, 'CHAIN', {
    enumerable: true,
    get: function () { return protocol.CHAIN; }
});
Object.defineProperty(exports, 'CONNECT_ITEM_ERROR_CODES', {
    enumerable: true,
    get: function () { return protocol.CONNECT_ITEM_ERROR_CODES; }
});
exports.BadRequestError = BadRequestError;
exports.FetchWalletsError = FetchWalletsError;
exports.LocalstorageNotFoundError = LocalstorageNotFoundError;
exports.ParseHexError = ParseHexError;
exports.TonConnect = TonConnect;
exports.TonConnectError = TonConnectError;
exports.UnknownAppError = UnknownAppError;
exports.UnknownError = UnknownError;
exports.UserRejectsError = UserRejectsError;
exports.WalletAlreadyConnectedError = WalletAlreadyConnectedError;
exports.WalletNotConnectedError = WalletNotConnectedError;
exports.WalletNotInjectedError = WalletNotInjectedError;
exports.WalletsListManager = WalletsListManager;
exports.WrongAddressError = WrongAddressError;
exports.default = TonConnect;
exports.encodeTelegramUrlParameters = encodeTelegramUrlParameters;
exports.isTelegramUrl = isTelegramUrl;
exports.isWalletInfoCurrentlyEmbedded = isWalletInfoCurrentlyEmbedded;
exports.isWalletInfoCurrentlyInjected = isWalletInfoCurrentlyInjected;
exports.isWalletInfoInjectable = isWalletInfoInjectable;
exports.isWalletInfoInjected = isWalletInfoInjected;
exports.isWalletInfoRemote = isWalletInfoRemote;
exports.toUserFriendlyAddress = toUserFriendlyAddress;
//# sourceMappingURL=index.cjs.map
