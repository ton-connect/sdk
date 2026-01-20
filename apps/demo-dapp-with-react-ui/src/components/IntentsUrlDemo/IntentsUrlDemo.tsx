import { useState, useCallback } from 'react';
import {
    IntentRequest,
    MakeSendTransactionIntentRequest,
    MakeSignDataIntentRequest,
    MakeSendActionIntentRequest,
    IntentItem,
    SendTonItem,
    SendJettonItem,
    SendNftItem,
    SignDataPayload,
    ConnectRequest,
    ConnectItem,
    createTransactionIntent,
    createSignDataIntent,
    createActionIntent,
    createTonTransferItem,
    createJettonTransferItem,
    createNftTransferItem,
    createTextSignDataPayload,
    createBinarySignDataPayload,
    createCellSignDataPayload,
    generateIntentUrlInlineWithEncoding,
} from './index';
import './style.scss';

type IntentType = 'txIntent' | 'signIntent' | 'actionIntent';

const defaultClientPubKey = '365c43da7eeb2ac071c3b4da695ff8b03f055d79e5cc8aac4fef72e86e638956';
const defaultManifestUrl = 'https://tonconnect-demo-dapp-with-react-ui.vercel.app/tonconnect-manifest.vercel.json';

export function IntentsUrlDemo() {
    const [clientPubKey, setClientPubKey] = useState(defaultClientPubKey);
    const [intentType, setIntentType] = useState<IntentType>('txIntent');
    const [network, setNetwork] = useState<string>('');
    const [validUntil, setValidUntil] = useState<number>(Math.ceil(Date.now() / 1000) + 3600);
    
    // Connect request state
    const [includeConnectRequest, setIncludeConnectRequest] = useState(false);
    const [manifestUrl, setManifestUrl] = useState(defaultManifestUrl);
    const [includeTonAddr, setIncludeTonAddr] = useState(true);
    const [includeTonProof, setIncludeTonProof] = useState(false);
    const [tonProofPayload, setTonProofPayload] = useState('dc61a65e1c975398e5f22afae15e4d8de936ea0bf897a56a770da71a96ff10f9');
    
    // Transaction intent state
    const [transactionItems, setTransactionItems] = useState<IntentItem[]>([
        createTonTransferItem(
            'UQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJKZ',
            '20000000'
        ),
    ]);
    
    // Sign data intent state
    const [signDataPayloadType, setSignDataPayloadType] = useState<'text' | 'binary' | 'cell'>('text');
    const [signDataText, setSignDataText] = useState('Confirm email update to user@example.com');
    const [signDataBinary, setSignDataBinary] = useState('');
    const [signDataCellSchema, setSignDataCellSchema] = useState('');
    const [signDataCell, setSignDataCell] = useState('');
    const [signDataManifestUrl, setSignDataManifestUrl] = useState('');
    
    // Action intent state
    const [actionUrl, setActionUrl] = useState('https://example.com/dex?action=swap');
    
    // Encoding method state
    const [showBothEncodings, setShowBothEncodings] = useState(true);
    const [generatedUrlBase64, setGeneratedUrlBase64] = useState<string>('');
    const [generatedUrlEncodeURI, setGeneratedUrlEncodeURI] = useState<string>('');

    const buildConnectRequest = useCallback((): ConnectRequest | undefined => {
        if (!includeConnectRequest) return undefined;
        
        const items: ConnectItem[] = [];
        if (includeTonAddr) {
            items.push({ name: 'ton_addr' });
        }
        if (includeTonProof) {
            items.push({ name: 'ton_proof', payload: tonProofPayload });
        }
        
        if (items.length === 0) return undefined;
        
        return {
            manifestUrl,
            items,
        };
    }, [includeConnectRequest, manifestUrl, includeTonAddr, includeTonProof, tonProofPayload]);

    const generateUrl = useCallback(() => {
        try {
            const connectRequest = buildConnectRequest();
            const options = {
                ...(connectRequest && { connectRequest }),
                ...(network && { network }),
            };

            let intent: IntentRequest;

            if (intentType === 'txIntent') {
                intent = createTransactionIntent(
                    clientPubKey,
                    transactionItems,
                    {
                        ...options,
                        ...(validUntil && { validUntil }),
                    }
                );
            } else if (intentType === 'signIntent') {
                let payload: SignDataPayload;
                if (signDataPayloadType === 'text') {
                    payload = createTextSignDataPayload(signDataText);
                } else if (signDataPayloadType === 'binary') {
                    payload = createBinarySignDataPayload(signDataBinary);
                } else {
                    payload = createCellSignDataPayload(signDataCellSchema, signDataCell);
                }
                
                intent = createSignDataIntent(clientPubKey, payload, {
                    ...options,
                    ...(signDataManifestUrl && { manifestUrl: signDataManifestUrl }),
                });
            } else {
                intent = createActionIntent(clientPubKey, actionUrl, options);
            }

            const urlBase64 = generateIntentUrlInlineWithEncoding(clientPubKey, intent, 'base64url');
            const urlEncodeURI = generateIntentUrlInlineWithEncoding(clientPubKey, intent, 'encodeURI');
            setGeneratedUrlBase64(urlBase64);
            setGeneratedUrlEncodeURI(urlEncodeURI);
        } catch (error) {
            const errorMsg = `Error: ${error instanceof Error ? error.message : String(error)}`;
            setGeneratedUrlBase64(errorMsg);
            setGeneratedUrlEncodeURI(errorMsg);
        }
    }, [
        clientPubKey,
        intentType,
        network,
        validUntil,
        includeConnectRequest,
        manifestUrl,
        includeTonAddr,
        includeTonProof,
        tonProofPayload,
        transactionItems,
        signDataPayloadType,
        signDataText,
        signDataBinary,
        signDataCellSchema,
        signDataCell,
        signDataManifestUrl,
        actionUrl,
        buildConnectRequest,
    ]);

    const addTransactionItem = useCallback((type: 'ton' | 'jetton' | 'nft') => {
        if (type === 'ton') {
            setTransactionItems([...transactionItems, createTonTransferItem('', '0')]);
        } else if (type === 'jetton') {
            setTransactionItems([...transactionItems, createJettonTransferItem('', '0', '')]);
        } else {
            setTransactionItems([...transactionItems, createNftTransferItem('', '')]);
        }
    }, [transactionItems]);

    const removeTransactionItem = useCallback((index: number) => {
        setTransactionItems(transactionItems.filter((_, i) => i !== index));
    }, [transactionItems]);

    const updateTransactionItem = useCallback((index: number, item: IntentItem) => {
        const newItems = [...transactionItems];
        newItems[index] = item;
        setTransactionItems(newItems);
    }, [transactionItems]);

    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
    }, []);

    return (
        <div className="intents-url-demo">
            <h3>Dynamic Intent URL Builder</h3>

            <div className="intents-url-demo__section">
                <label>
                    <span>Client Public Key:</span>
                    <input
                        type="text"
                        value={clientPubKey}
                        onChange={(e) => setClientPubKey(e.target.value)}
                        placeholder="Enter client public key"
                    />
                </label>
            </div>

            <div className="intents-url-demo__section">
                <label>
                    <span>Intent Type:</span>
                    <select value={intentType} onChange={(e) => setIntentType(e.target.value as IntentType)}>
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
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        placeholder="e.g., -239 (mainnet), -3 (testnet), or leave empty"
                    />
                </label>
            </div>

            <div className="intents-url-demo__section">
                <label>
                    <input
                        type="checkbox"
                        checked={includeConnectRequest}
                        onChange={(e) => setIncludeConnectRequest(e.target.checked)}
                    />
                    <span>Include Connect Request</span>
                </label>
            </div>

            {includeConnectRequest && (
                <div className="intents-url-demo__subsection">
                    <label>
                        <span>Manifest URL:</span>
                        <input
                            type="text"
                            value={manifestUrl}
                            onChange={(e) => setManifestUrl(e.target.value)}
                            placeholder="Manifest URL"
                        />
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={includeTonAddr}
                            onChange={(e) => setIncludeTonAddr(e.target.checked)}
                        />
                        <span>Include ton_addr</span>
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={includeTonProof}
                            onChange={(e) => setIncludeTonProof(e.target.checked)}
                        />
                        <span>Include ton_proof</span>
                    </label>
                    {includeTonProof && (
                        <label>
                            <span>Ton Proof Payload:</span>
                            <input
                                type="text"
                                value={tonProofPayload}
                                onChange={(e) => setTonProofPayload(e.target.value)}
                                placeholder="Ton proof payload"
                            />
                        </label>
                    )}
                </div>
            )}

            {intentType === 'txIntent' && (
                <div className="intents-url-demo__subsection">
                    <label>
                        <span>Valid Until (Unix timestamp, optional):</span>
                        <input
                            type="number"
                            value={validUntil}
                            onChange={(e) => setValidUntil(Number(e.target.value))}
                        />
                    </label>
                    <div className="intents-url-demo__items">
                        <div className="intents-url-demo__items-header">
                            <span>Transaction Items:</span>
                            <div className="intents-url-demo__buttons">
                                <button onClick={() => addTransactionItem('ton')}>Add TON Transfer</button>
                                <button onClick={() => addTransactionItem('jetton')}>Add Jetton Transfer</button>
                                <button onClick={() => addTransactionItem('nft')}>Add NFT Transfer</button>
                            </div>
                        </div>
                        {transactionItems.map((item, index) => (
                            <TransactionItemEditor
                                key={index}
                                item={item}
                                index={index}
                                onUpdate={(updatedItem) => updateTransactionItem(index, updatedItem)}
                                onRemove={() => removeTransactionItem(index)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {intentType === 'signIntent' && (
                <div className="intents-url-demo__subsection">
                    <label>
                        <span>Payload Type:</span>
                        <select
                            value={signDataPayloadType}
                            onChange={(e) => setSignDataPayloadType(e.target.value as 'text' | 'binary' | 'cell')}
                        >
                            <option value="text">Text</option>
                            <option value="binary">Binary</option>
                            <option value="cell">Cell</option>
                        </select>
                    </label>
                    {signDataPayloadType === 'text' && (
                        <label>
                            <span>Text:</span>
                            <textarea
                                value={signDataText}
                                onChange={(e) => setSignDataText(e.target.value)}
                                placeholder="Enter text to sign"
                                rows={3}
                            />
                        </label>
                    )}
                    {signDataPayloadType === 'binary' && (
                        <label>
                            <span>Binary (Base64):</span>
                            <textarea
                                value={signDataBinary}
                                onChange={(e) => setSignDataBinary(e.target.value)}
                                placeholder="Enter base64 encoded bytes"
                                rows={3}
                            />
                        </label>
                    )}
                    {signDataPayloadType === 'cell' && (
                        <>
                            <label>
                                <span>Schema:</span>
                                <textarea
                                    value={signDataCellSchema}
                                    onChange={(e) => setSignDataCellSchema(e.target.value)}
                                    placeholder="TL-B schema"
                                    rows={2}
                                />
                            </label>
                            <label>
                                <span>Cell (Base64):</span>
                                <textarea
                                    value={signDataCell}
                                    onChange={(e) => setSignDataCell(e.target.value)}
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
                            value={signDataManifestUrl}
                            onChange={(e) => setSignDataManifestUrl(e.target.value)}
                            placeholder="Manifest URL"
                        />
                    </label>
                </div>
            )}

            {intentType === 'actionIntent' && (
                <div className="intents-url-demo__subsection">
                    <label>
                        <span>Action URL:</span>
                        <input
                            type="text"
                            value={actionUrl}
                            onChange={(e) => setActionUrl(e.target.value)}
                            placeholder="Action URL"
                        />
                    </label>
                </div>
            )}

            <div className="intents-url-demo__section">
                <label>
                    <input
                        type="checkbox"
                        checked={showBothEncodings}
                        onChange={(e) => setShowBothEncodings(e.target.checked)}
                    />
                    <span>Show both encoding methods</span>
                </label>
            </div>

            <button className="intents-url-demo__generate-btn" onClick={generateUrl}>
                Generate Intent URL
            </button>

            {(generatedUrlBase64 || generatedUrlEncodeURI) && (
                <div className="intents-url-demo__results">
                    {showBothEncodings ? (
                        <>
                            <div className="intents-url-demo__result">
                                <div className="intents-url-demo__result-header">
                                    <span>Generated URL (Base64URL encoding):</span>
                                    <div className="intents-url-demo__result-actions">
                                        <span className="intents-url-demo__result-length">Length: {generatedUrlBase64.length}</span>
                                        <button onClick={() => copyToClipboard(generatedUrlBase64)}>Copy</button>
                                    </div>
                                </div>
                                <div className="intents-url-demo__result-url">{generatedUrlBase64}</div>
                            </div>
                            <div className="intents-url-demo__result">
                                <div className="intents-url-demo__result-header">
                                    <span>Generated URL (encodeURIComponent encoding):</span>
                                    <div className="intents-url-demo__result-actions">
                                        <span className="intents-url-demo__result-length">Length: {generatedUrlEncodeURI.length}</span>
                                        <button onClick={() => copyToClipboard(generatedUrlEncodeURI)}>Copy</button>
                                    </div>
                                </div>
                                <div className="intents-url-demo__result-url">{generatedUrlEncodeURI}</div>
                            </div>
                        </>
                    ) : (
                        <div className="intents-url-demo__result">
                            <div className="intents-url-demo__result-header">
                                <span>Generated URL (Base64URL):</span>
                                <div className="intents-url-demo__result-actions">
                                    <span className="intents-url-demo__result-length">Length: {generatedUrlBase64.length}</span>
                                    <button onClick={() => copyToClipboard(generatedUrlBase64)}>Copy</button>
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
                        onChange={(e) => onUpdate({ ...item, a: e.target.value })}
                    />
                </label>
                <label>
                    <span>Amount (nanocoins):</span>
                    <input
                        type="text"
                        value={item.am}
                        onChange={(e) => onUpdate({ ...item, am: e.target.value })}
                    />
                </label>
                <label>
                    <span>Payload (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.p || ''}
                        onChange={(e) => onUpdate({ ...item, p: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>State Init (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.si || ''}
                        onChange={(e) => onUpdate({ ...item, si: e.target.value || undefined })}
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
                        onChange={(e) => onUpdate({ ...item, ma: e.target.value })}
                    />
                </label>
                <label>
                    <span>Jetton Amount:</span>
                    <input
                        type="text"
                        value={item.ja}
                        onChange={(e) => onUpdate({ ...item, ja: e.target.value })}
                    />
                </label>
                <label>
                    <span>Destination:</span>
                    <input
                        type="text"
                        value={item.d}
                        onChange={(e) => onUpdate({ ...item, d: e.target.value })}
                    />
                </label>
                <label>
                    <span>Query ID (optional):</span>
                    <input
                        type="number"
                        value={item.qi || ''}
                        onChange={(e) => onUpdate({ ...item, qi: e.target.value ? Number(e.target.value) : undefined })}
                    />
                </label>
                <label>
                    <span>Response Destination (optional):</span>
                    <input
                        type="text"
                        value={item.rd || ''}
                        onChange={(e) => onUpdate({ ...item, rd: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Custom Payload (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.cp || ''}
                        onChange={(e) => onUpdate({ ...item, cp: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Forward TON Amount (optional):</span>
                    <input
                        type="text"
                        value={item.fta || ''}
                        onChange={(e) => onUpdate({ ...item, fta: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Forward Payload (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.fp || ''}
                        onChange={(e) => onUpdate({ ...item, fp: e.target.value || undefined })}
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
                        onChange={(e) => onUpdate({ ...item, na: e.target.value })}
                    />
                </label>
                <label>
                    <span>New Owner:</span>
                    <input
                        type="text"
                        value={item.no}
                        onChange={(e) => onUpdate({ ...item, no: e.target.value })}
                    />
                </label>
                <label>
                    <span>Query ID (optional):</span>
                    <input
                        type="number"
                        value={item.qi || ''}
                        onChange={(e) => onUpdate({ ...item, qi: e.target.value ? Number(e.target.value) : undefined })}
                    />
                </label>
                <label>
                    <span>Response Destination (optional):</span>
                    <input
                        type="text"
                        value={item.rd || ''}
                        onChange={(e) => onUpdate({ ...item, rd: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Custom Payload (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.cp || ''}
                        onChange={(e) => onUpdate({ ...item, cp: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Forward TON Amount (optional):</span>
                    <input
                        type="text"
                        value={item.fta || ''}
                        onChange={(e) => onUpdate({ ...item, fta: e.target.value || undefined })}
                    />
                </label>
                <label>
                    <span>Forward Payload (Base64, optional):</span>
                    <input
                        type="text"
                        value={item.fp || ''}
                        onChange={(e) => onUpdate({ ...item, fp: e.target.value || undefined })}
                    />
                </label>
            </div>
        );
    }

    return null;
}
