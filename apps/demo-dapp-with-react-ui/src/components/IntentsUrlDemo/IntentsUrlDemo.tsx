import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactJson from 'react-json-view';
import { Address, beginCell, toNano } from '@ton/core';
import {
    IntentRequest,
    IntentItem,
    SignDataPayload,
    ConnectRequest,
    createTransactionIntent,
    createSignDataIntent,
    createActionIntent,
    createTonTransferItem,
    createJettonTransferItem,
    createNftTransferItem,
    createTextSignDataPayload,
    createBinarySignDataPayload,
    createCellSignDataPayload,
    generateIntentUrlInlineWithEncoding
} from './index';
import './style.scss';

type IntentType = 'txIntent' | 'signIntent' | 'actionIntent';

const defaultClientPubKey = '365c43da7eeb2ac071c3b4da695ff8b03f055d79e5cc8aac4fef72e86e638956';
const defaultManifestUrl =
    'https://tonconnect-demo-dapp-with-react-ui.vercel.app/tonconnect-manifest.vercel.json';
const defaultAddress = 'UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJKZ';
const defaultAmount = '20000000';

interface State {
    clientPubKey: string;
    intentType: IntentType;
    network: string;
    validUntil: number;
    includeConnectRequest: boolean;
    manifestUrl: string;
    includeTonAddr: boolean;
    includeTonProof: boolean;
    tonProofPayload: string;
    transactionItems: IntentItem[];
    signDataPayloadType: 'text' | 'binary' | 'cell';
    signDataText: string;
    signDataBinary: string;
    signDataCellSchema: string;
    signDataCell: string;
    signDataManifestUrl: string;
    actionUrl: string;
    showBothEncodings: boolean;
}

const defaultState: State = {
    clientPubKey: defaultClientPubKey,
    intentType: 'txIntent',
    network: '',
    validUntil: Math.ceil(Date.now() / 1000) + 3600,
    includeConnectRequest: false,
    manifestUrl: defaultManifestUrl,
    includeTonAddr: true,
    includeTonProof: false,
    tonProofPayload: 'dc61a65e1c975398e5f22afae15e4d8de936ea0bf897a56a770da71a96ff10f9',
    transactionItems: [createTonTransferItem(defaultAddress, defaultAmount)],
    signDataPayloadType: 'text',
    signDataText: 'Confirm email update to user@example.com',
    signDataBinary: '',
    signDataCellSchema: '',
    signDataCell: '',
    signDataManifestUrl: '',
    actionUrl: 'https://example.com/dex?action=swap',
    showBothEncodings: true
};

function serializeState(state: State): string {
    return btoa(JSON.stringify(state));
}

function deserializeState(encoded: string): Partial<State> | null {
    try {
        return JSON.parse(atob(encoded));
    } catch {
        return null;
    }
}

export function IntentsUrlDemo() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [state, setState] = useState<State>(defaultState);
    const [generatedUrlBase64, setGeneratedUrlBase64] = useState<string>('');
    const [generatedUrlEncodeURI, setGeneratedUrlEncodeURI] = useState<string>('');
    const [rawIntent, setRawIntent] = useState<IntentRequest | null>(null);
    const isInitializing = useRef(true);

    // Load state from URL on mount
    useEffect(() => {
        const encoded = searchParams.get('state');
        if (encoded) {
            const loaded = deserializeState(encoded);
            if (loaded) {
                setState(prev => ({ ...defaultState, ...prev, ...loaded }));
            }
        }
        isInitializing.current = false;
    }, []); // Only on mount

    // Update URL whenever state changes (but not when initializing from URL)
    useEffect(() => {
        if (isInitializing.current) return;

        const encoded = serializeState(state);
        const currentEncoded = searchParams.get('state');
        if (currentEncoded !== encoded) {
            const newParams = new URLSearchParams();
            newParams.set('state', encoded);
            setSearchParams(newParams, { replace: true });
        }
    }, [state, searchParams, setSearchParams]);

    // Helper function to normalize addresses using Address.parse().toString()
    const normalizeAddress = useCallback((address: string): string => {
        if (!address) return address;
        try {
            return Address.parse(address).toString();
        } catch {
            // If parsing fails, return original address
            return address;
        }
    }, []);

    // Helper function to normalize transaction items with addresses
    const normalizeTransactionItems = useCallback(
        (items: IntentItem[]): IntentItem[] => {
            return items.map(item => {
                if (item.t === 'ton') {
                    return {
                        ...item,
                        a: normalizeAddress(item.a)
                    };
                } else if (item.t === 'jetton') {
                    return {
                        ...item,
                        ma: normalizeAddress(item.ma),
                        d: normalizeAddress(item.d),
                        ...(item.rd && { rd: normalizeAddress(item.rd) })
                    };
                } else if (item.t === 'nft') {
                    return {
                        ...item,
                        na: normalizeAddress(item.na),
                        no: normalizeAddress(item.no),
                        ...(item.rd && { rd: normalizeAddress(item.rd) })
                    };
                }
                return item;
            });
        },
        [normalizeAddress]
    );

    // Auto-generate URLs whenever relevant state changes
    useEffect(() => {
        try {
            const connectRequest: ConnectRequest | undefined = state.includeConnectRequest
                ? {
                      manifestUrl: state.manifestUrl,
                      items: [
                          ...(state.includeTonAddr ? [{ name: 'ton_addr' as const }] : []),
                          ...(state.includeTonProof
                              ? [{ name: 'ton_proof' as const, payload: state.tonProofPayload }]
                              : [])
                      ]
                  }
                : undefined;

            const options = {
                ...(connectRequest && { connectRequest }),
                ...(state.network && { network: state.network })
            };

            let intent: IntentRequest;

            if (state.intentType === 'txIntent') {
                const normalizedItems = normalizeTransactionItems(state.transactionItems);
                intent = createTransactionIntent('0', normalizedItems, {
                    ...options,
                    ...(state.validUntil && { validUntil: state.validUntil })
                });
            } else if (state.intentType === 'signIntent') {
                let payload: SignDataPayload;
                if (state.signDataPayloadType === 'text') {
                    payload = createTextSignDataPayload(state.signDataText);
                } else if (state.signDataPayloadType === 'binary') {
                    payload = createBinarySignDataPayload(state.signDataBinary);
                } else {
                    payload = createCellSignDataPayload(
                        state.signDataCellSchema,
                        state.signDataCell
                    );
                }

                intent = createSignDataIntent('0', payload, {
                    ...options,
                    ...(state.signDataManifestUrl && { manifestUrl: state.signDataManifestUrl })
                });
            } else {
                intent = createActionIntent('0', state.actionUrl, options);
            }

            setRawIntent(intent);
            const urlBase64 = generateIntentUrlInlineWithEncoding(
                state.clientPubKey,
                intent,
                'base64url'
            );
            const urlEncodeURI = generateIntentUrlInlineWithEncoding(
                state.clientPubKey,
                intent,
                'encodeURI'
            );
            setGeneratedUrlBase64(urlBase64);
            setGeneratedUrlEncodeURI(urlEncodeURI);
        } catch (error) {
            const errorMsg = `Error: ${error instanceof Error ? error.message : String(error)}`;
            setGeneratedUrlBase64(errorMsg);
            setGeneratedUrlEncodeURI(errorMsg);
        }
    }, [state, normalizeTransactionItems]);

    const updateState = useCallback((updates: Partial<State>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const addTransactionItem = useCallback(
        (type: 'ton' | 'jetton' | 'nft') => {
            let newItem: IntentItem;
            if (type === 'ton') {
                newItem = createTonTransferItem(defaultAddress, defaultAmount);
            } else if (type === 'jetton') {
                newItem = createJettonTransferItem(defaultAddress, defaultAmount, defaultAddress);
            } else {
                newItem = createNftTransferItem(defaultAddress, defaultAddress);
            }
            updateState({
                transactionItems: [...state.transactionItems, newItem]
            });
        },
        [state.transactionItems, updateState]
    );

    const removeTransactionItem = useCallback(
        (index: number) => {
            updateState({
                transactionItems: state.transactionItems.filter((_, i) => i !== index)
            });
        },
        [state.transactionItems, updateState]
    );

    const updateTransactionItem = useCallback(
        (index: number, item: IntentItem) => {
            const newItems = [...state.transactionItems];
            newItems[index] = item;
            updateState({ transactionItems: newItems });
        },
        [state.transactionItems, updateState]
    );

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
    }, []);

    // Template functions based on gen.ts
    const loadTemplate = useCallback(
        (templateName: string) => {
            const tonProofPayload =
                'dc61a65e1c975398e5f22afae15e4d8de936ea0bf897a56a770da71a96ff10f9';
            const clientPubKey = '365c43da7eeb2ac071c3b4da695ff8b03f055d79e5cc8aac4fef72e86e638956';
            const manifestUrl =
                'https://tonconnect-demo-dapp-with-react-ui.vercel.app/tonconnect-manifest.vercel.json';

            const cell = beginCell()
                .storeUint(0, 256)
                .storeUint(0, 256)
                .storeUint(0, 256)
                .storeUint(0, 255)
                .endCell()
                .toBoc()
                .toString('base64');

            const address = Address.parse(
                '-1:5555555555555555555555555555555555555555555555555555555555555555'
            ).toString();
            const amount = toNano(1).toString();

            const baseFields = {
                includeConnectRequest: true,
                includeTonAddr: true,
                includeTonProof: true,
                tonProofPayload,
                manifestUrl,
                clientPubKey
            };
            switch (templateName) {
                case 'tonTransfer':
                    updateState({
                        intentType: 'txIntent',
                        transactionItems: [createTonTransferItem(address, amount)],
                        validUntil: Math.ceil(Date.now() / 1000) + 3600,
                        network: '-239',
                        ...baseFields
                    });
                    break;
                case 'tonJettonTransfer':
                    updateState({
                        intentType: 'txIntent',
                        transactionItems: [
                            createTonTransferItem(address, amount),
                            createJettonTransferItem(address, amount, address)
                        ],
                        validUntil: Math.ceil(Date.now() / 1000) + 3600,
                        network: '-239',
                        ...baseFields
                    });
                    break;
                case 'jettonTransfer':
                    updateState({
                        intentType: 'txIntent',
                        transactionItems: [createJettonTransferItem(address, amount, address)],
                        validUntil: Math.ceil(Date.now() / 1000) + 3600,
                        network: '-239',
                        ...baseFields
                    });
                    break;
                case 'jetton2Transfer':
                    updateState({
                        intentType: 'txIntent',
                        transactionItems: [
                            createJettonTransferItem(address, amount, address),
                            createJettonTransferItem(address, amount, address)
                        ],
                        validUntil: Math.ceil(Date.now() / 1000) + 3600,
                        network: '-239',
                        ...baseFields
                    });
                    break;
                case 'jettonWithPayload':
                    updateState({
                        intentType: 'txIntent',
                        transactionItems: [
                            createJettonTransferItem(address, amount, address, {
                                forwardPayload: cell
                            })
                        ],
                        validUntil: Math.ceil(Date.now() / 1000) + 3600,
                        network: '-239',
                        ...baseFields
                    });
                    break;
                case 'nftTransfer':
                    updateState({
                        intentType: 'txIntent',
                        transactionItems: [createNftTransferItem(address, address)],
                        validUntil: Math.ceil(Date.now() / 1000) + 3600,
                        network: '-239',
                        ...baseFields
                    });
                    break;
                case 'signDataText':
                    updateState({
                        intentType: 'signIntent',
                        signDataPayloadType: 'text',
                        signDataText: 's'.repeat(395),
                        network: '-239',
                        ...baseFields
                    });
                    break;
                case 'signDataBinary':
                    updateState({
                        intentType: 'signIntent',
                        signDataPayloadType: 'binary',
                        signDataBinary:
                            'hRGGfQ/I0EgFGLbDRcmiE6xUjd7bld5oT1dsq8aZvI8wjlXW/8AoJCfmVCQs/AO+Lwe7J/+DOBTan5jOVsHugrIe60Mm5b8fuBjlJDffbTTlPUppDRMgueoaAWXEVEgWjGg+Oj3mkrKB95iUIlYuZUfSXOwjwz5agwOsObl5ZoHZCVmPNlJLULoTyMRDUCWRuXHURWny5hJHtFiR+3g3Zfc4LJrBsxUqvivO4l4fJVHwa4uGw6110sRGmxHV9YbTUhgnY+4yRwE40p0LZwCme2tj7KWsUpqXRwtX7WVkQ1awMEEE6GqjXg5BCo4WJKytSZkLX1RmnTUvJF+b/804QyOf2IIFy+tG3zldvCI0Qz4l4D24pPC830qPwvHNCVTv0v85IhAn',
                        network: '-239',
                        ...baseFields
                    });
                    break;
                case 'signDataCell':
                    updateState({
                        intentType: 'signIntent',
                        signDataPayloadType: 'cell',
                        signDataCellSchema: 'a'.repeat(100),
                        signDataCell: cell,
                        network: '-239',
                        ...baseFields
                    });
                    break;
                case 'actionIntent':
                    updateState({
                        intentType: 'actionIntent',
                        actionUrl: 'a'.repeat(428),
                        ...baseFields
                    });
                    break;
            }
        },
        [updateState, state.tonProofPayload]
    );

    return (
        <div className="intents-url-demo">
            <h3>Dynamic Intent URL Builder</h3>

            <div className="intents-url-demo__section">
                <label>
                    <span>Templates:</span>
                    <div className="intents-url-demo__templates">
                        <button onClick={() => loadTemplate('tonTransfer')}>TON Transfer</button>
                        <button onClick={() => loadTemplate('tonJettonTransfer')}>
                            TON + Jetton
                        </button>
                        <button onClick={() => loadTemplate('jettonTransfer')}>
                            Jetton Transfer
                        </button>
                        <button onClick={() => loadTemplate('jetton2Transfer')}>
                            2 Jetton Transfer
                        </button>
                        <button onClick={() => loadTemplate('jettonWithPayload')}>
                            Jetton with 1023 bit 1 cell payload
                        </button>
                        <button onClick={() => loadTemplate('nftTransfer')}>NFT Transfer</button>
                        <button onClick={() => loadTemplate('signDataText')}>SignData Text</button>
                        <button onClick={() => loadTemplate('signDataBinary')}>
                            SignData Binary
                        </button>
                        <button onClick={() => loadTemplate('signDataCell')}>SignData Cell</button>
                        <button onClick={() => loadTemplate('actionIntent')}>Action Intent</button>
                    </div>
                </label>
            </div>

            <div className="intents-url-demo__section">
                <label>
                    <span>Client Public Key:</span>
                    <input
                        type="text"
                        value={state.clientPubKey}
                        onChange={e => updateState({ clientPubKey: e.target.value })}
                        placeholder="Enter client public key"
                    />
                </label>
            </div>

            <div className="intents-url-demo__section">
                <label>
                    <span>Intent Type:</span>
                    <select
                        value={state.intentType}
                        onChange={e => updateState({ intentType: e.target.value as IntentType })}
                    >
                        <option value="txIntent">Transaction Intent</option>
                        <option value="signIntent">Sign Data Intent</option>
                        <option value="actionIntent">Action Intent</option>
                    </select>
                </label>
            </div>

            <div className="intents-url-demo__section">
                <label>
                    <span>Network (optional):</span>
                    <input
                        type="text"
                        value={state.network}
                        onChange={e => updateState({ network: e.target.value })}
                        placeholder="e.g., -239 (mainnet), -3 (testnet), or leave empty"
                    />
                </label>
            </div>

            <div className="intents-url-demo__section">
                <label>
                    <input
                        type="checkbox"
                        checked={state.includeConnectRequest}
                        onChange={e => updateState({ includeConnectRequest: e.target.checked })}
                    />
                    <span>Include Connect Request</span>
                </label>
            </div>

            {state.includeConnectRequest && (
                <div className="intents-url-demo__subsection">
                    <label>
                        <span>Manifest URL:</span>
                        <input
                            type="text"
                            value={state.manifestUrl}
                            onChange={e => updateState({ manifestUrl: e.target.value })}
                            placeholder="Manifest URL"
                        />
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={state.includeTonAddr}
                            onChange={e => updateState({ includeTonAddr: e.target.checked })}
                        />
                        <span>Include ton_addr</span>
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={state.includeTonProof}
                            onChange={e => updateState({ includeTonProof: e.target.checked })}
                        />
                        <span>Include ton_proof</span>
                    </label>
                    {state.includeTonProof && (
                        <label>
                            <span>Ton Proof Payload:</span>
                            <input
                                type="text"
                                value={state.tonProofPayload}
                                onChange={e => updateState({ tonProofPayload: e.target.value })}
                                placeholder="Ton proof payload"
                            />
                        </label>
                    )}
                </div>
            )}

            {state.intentType === 'txIntent' && (
                <div className="intents-url-demo__subsection">
                    <label>
                        <span>Valid Until (Unix timestamp, optional):</span>
                        <input
                            type="number"
                            value={state.validUntil}
                            onChange={e => updateState({ validUntil: Number(e.target.value) })}
                        />
                    </label>
                    <div className="intents-url-demo__items">
                        <div className="intents-url-demo__items-header">
                            <span>Transaction Items:</span>
                            <div className="intents-url-demo__buttons">
                                <button onClick={() => addTransactionItem('ton')}>
                                    Add TON Transfer
                                </button>
                                <button onClick={() => addTransactionItem('jetton')}>
                                    Add Jetton Transfer
                                </button>
                                <button onClick={() => addTransactionItem('nft')}>
                                    Add NFT Transfer
                                </button>
                            </div>
                        </div>
                        {state.transactionItems.map((item, index) => (
                            <TransactionItemEditor
                                key={index}
                                item={item}
                                index={index}
                                onUpdate={updatedItem => updateTransactionItem(index, updatedItem)}
                                onRemove={() => removeTransactionItem(index)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {state.intentType === 'signIntent' && (
                <div className="intents-url-demo__subsection">
                    <label>
                        <span>Payload Type:</span>
                        <select
                            value={state.signDataPayloadType}
                            onChange={e =>
                                updateState({
                                    signDataPayloadType: e.target.value as
                                        | 'text'
                                        | 'binary'
                                        | 'cell'
                                })
                            }
                        >
                            <option value="text">Text</option>
                            <option value="binary">Binary</option>
                            <option value="cell">Cell</option>
                        </select>
                    </label>
                    {state.signDataPayloadType === 'text' && (
                        <label>
                            <span>Text:</span>
                            <textarea
                                value={state.signDataText}
                                onChange={e => updateState({ signDataText: e.target.value })}
                                placeholder="Enter text to sign"
                                rows={3}
                            />
                        </label>
                    )}
                    {state.signDataPayloadType === 'binary' && (
                        <label>
                            <span>Binary (Base64):</span>
                            <textarea
                                value={state.signDataBinary}
                                onChange={e => updateState({ signDataBinary: e.target.value })}
                                placeholder="Enter base64 encoded bytes"
                                rows={3}
                            />
                        </label>
                    )}
                    {state.signDataPayloadType === 'cell' && (
                        <>
                            <label>
                                <span>Schema:</span>
                                <textarea
                                    value={state.signDataCellSchema}
                                    onChange={e =>
                                        updateState({ signDataCellSchema: e.target.value })
                                    }
                                    placeholder="TL-B schema"
                                    rows={2}
                                />
                            </label>
                            <label>
                                <span>Cell (Base64):</span>
                                <textarea
                                    value={state.signDataCell}
                                    onChange={e => updateState({ signDataCell: e.target.value })}
                                    placeholder="Base64 encoded BoC"
                                    rows={3}
                                />
                            </label>
                        </>
                    )}
                    <label>
                        <span>Manifest URL (optional, for signIntent):</span>
                        <input
                            type="text"
                            value={state.signDataManifestUrl}
                            onChange={e => updateState({ signDataManifestUrl: e.target.value })}
                            placeholder="Manifest URL"
                        />
                    </label>
                </div>
            )}

            {state.intentType === 'actionIntent' && (
                <div className="intents-url-demo__subsection">
                    <label>
                        <span>Action URL:</span>
                        <input
                            type="text"
                            value={state.actionUrl}
                            onChange={e => updateState({ actionUrl: e.target.value })}
                            placeholder="Action URL"
                        />
                    </label>
                </div>
            )}

            <div className="intents-url-demo__section">
                <label>
                    <input
                        type="checkbox"
                        checked={state.showBothEncodings}
                        onChange={e => updateState({ showBothEncodings: e.target.checked })}
                    />
                    <span>Show both encoding methods</span>
                </label>
            </div>

            {rawIntent && (
                <div className="intents-url-demo__result">
                    <div className="intents-url-demo__result-header">
                        <span>Raw Intent Data (before serialization):</span>
                    </div>
                    <div className="intents-url-demo__raw-intent">
                        <ReactJson
                            src={rawIntent}
                            name={false}
                            theme="ocean"
                            collapsed={false}
                            displayDataTypes={false}
                            displayObjectSize={false}
                            enableClipboard={true}
                        />
                    </div>
                </div>
            )}

            {(generatedUrlBase64 || generatedUrlEncodeURI) && (
                <div className="intents-url-demo__results">
                    {state.showBothEncodings ? (
                        <>
                            <div className="intents-url-demo__result">
                                <div className="intents-url-demo__result-header">
                                    <span>Generated URL (Base64URL encoding):</span>
                                    <div className="intents-url-demo__result-actions">
                                        <span className="intents-url-demo__result-length">
                                            Length: {generatedUrlBase64.length}
                                        </span>
                                        <button onClick={() => copyToClipboard(generatedUrlBase64)}>
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <div className="intents-url-demo__result-url">
                                    {generatedUrlBase64}
                                </div>
                            </div>
                            <div className="intents-url-demo__result">
                                <div className="intents-url-demo__result-header">
                                    <span>Generated URL (encodeURIComponent encoding):</span>
                                    <div className="intents-url-demo__result-actions">
                                        <span className="intents-url-demo__result-length">
                                            Length: {generatedUrlEncodeURI.length}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(generatedUrlEncodeURI)}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <div className="intents-url-demo__result-url">
                                    {generatedUrlEncodeURI}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="intents-url-demo__result">
                            <div className="intents-url-demo__result-header">
                                <span>Generated URL (Base64URL):</span>
                                <div className="intents-url-demo__result-actions">
                                    <span className="intents-url-demo__result-length">
                                        Length: {generatedUrlBase64.length}
                                    </span>
                                    <button onClick={() => copyToClipboard(generatedUrlBase64)}>
                                        Copy
                                    </button>
                                </div>
                            </div>
                            <div className="intents-url-demo__result-url">{generatedUrlBase64}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface TransactionItemEditorProps {
    item: IntentItem;
    index: number;
    onUpdate: (item: IntentItem) => void;
    onRemove: () => void;
}

function TransactionItemEditor({ item, index, onUpdate, onRemove }: TransactionItemEditorProps) {
    if (item.t === 'ton') {
        return (
            <div className="intents-url-demo__item-editor">
                <div className="intents-url-demo__item-header">
                    <span>TON Transfer #{index + 1}</span>
                    <button onClick={onRemove}>Remove</button>
                </div>
                <label>
                    <span>Address:</span>
                    <input
                        type="text"
                        value={item.a}
                        onChange={e => onUpdate({ ...item, a: e.target.value })}
                    />
                </label>
                <label>
                    <span>Amount (nanocoins):</span>
                    <input
                        type="text"
                        value={item.am}
                        onChange={e => onUpdate({ ...item, am: e.target.value })}
                    />
                </label>
                <label>
                    <span>Payload (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.p || ''}
                        onChange={e => onUpdate({ ...item, p: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>State Init (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.si || ''}
                        onChange={e => onUpdate({ ...item, si: e.target.value || undefined })}
                    />
                </label>
            </div>
        );
    }

    if (item.t === 'jetton') {
        return (
            <div className="intents-url-demo__item-editor">
                <div className="intents-url-demo__item-header">
                    <span>Jetton Transfer #{index + 1}</span>
                    <button onClick={onRemove}>Remove</button>
                </div>
                <label>
                    <span>Master Address:</span>
                    <input
                        type="text"
                        value={item.ma}
                        onChange={e => onUpdate({ ...item, ma: e.target.value })}
                    />
                </label>
                <label>
                    <span>Jetton Amount:</span>
                    <input
                        type="text"
                        value={item.ja}
                        onChange={e => onUpdate({ ...item, ja: e.target.value })}
                    />
                </label>
                <label>
                    <span>Destination:</span>
                    <input
                        type="text"
                        value={item.d}
                        onChange={e => onUpdate({ ...item, d: e.target.value })}
                    />
                </label>
                <label>
                    <span>Query ID (optional):</span>
                    <input
                        type="number"
                        value={item.qi || ''}
                        onChange={e =>
                            onUpdate({
                                ...item,
                                qi: e.target.value ? Number(e.target.value) : undefined
                            })
                        }
                    />
                </label>
                <label>
                    <span>Response Destination (optional):</span>
                    <input
                        type="text"
                        value={item.rd || ''}
                        onChange={e => onUpdate({ ...item, rd: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Custom Payload (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.cp || ''}
                        onChange={e => onUpdate({ ...item, cp: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Forward TON Amount (optional):</span>
                    <input
                        type="text"
                        value={item.fta || ''}
                        onChange={e => onUpdate({ ...item, fta: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Forward Payload (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.fp || ''}
                        onChange={e => onUpdate({ ...item, fp: e.target.value || undefined })}
                    />
                </label>
            </div>
        );
    }

    if (item.t === 'nft') {
        return (
            <div className="intents-url-demo__item-editor">
                <div className="intents-url-demo__item-header">
                    <span>NFT Transfer #{index + 1}</span>
                    <button onClick={onRemove}>Remove</button>
                </div>
                <label>
                    <span>NFT Address:</span>
                    <input
                        type="text"
                        value={item.na}
                        onChange={e => onUpdate({ ...item, na: e.target.value })}
                    />
                </label>
                <label>
                    <span>New Owner:</span>
                    <input
                        type="text"
                        value={item.no}
                        onChange={e => onUpdate({ ...item, no: e.target.value })}
                    />
                </label>
                <label>
                    <span>Query ID (optional):</span>
                    <input
                        type="number"
                        value={item.qi || ''}
                        onChange={e =>
                            onUpdate({
                                ...item,
                                qi: e.target.value ? Number(e.target.value) : undefined
                            })
                        }
                    />
                </label>
                <label>
                    <span>Response Destination (optional):</span>
                    <input
                        type="text"
                        value={item.rd || ''}
                        onChange={e => onUpdate({ ...item, rd: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Custom Payload (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.cp || ''}
                        onChange={e => onUpdate({ ...item, cp: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Forward TON Amount (optional):</span>
                    <input
                        type="text"
                        value={item.fta || ''}
                        onChange={e => onUpdate({ ...item, fta: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Forward Payload (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.fp || ''}
                        onChange={e => onUpdate({ ...item, fp: e.target.value || undefined })}
                    />
                </label>
            </div>
        );
    }

    return null;
}
