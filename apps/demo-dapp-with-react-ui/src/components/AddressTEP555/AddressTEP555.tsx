import { useCallback, useState } from 'react';
import { Address } from '@ton/core';
import { AddressRow } from './AddressRow';
import { AddressFlags, OriginalFlags } from './AddressFlags';
import './style.scss';

type AddressData = {
    address: Address;
    sidechainAddress: Address;
    originalFlags: OriginalFlags;
};

const safeFriendly = (address: Address, args: { bounceable: boolean; testOnly?: boolean }) => {
    try {
        return address.toString({ urlSafe: true, ...args });
    } catch (error: unknown) {
        if (
            typeof error === 'object' &&
            error &&
            'message' in error &&
            typeof error.message === 'string'
        ) {
            return error.message;
        }
        return null;
    }
};

function parseAddressValue(value: string): AddressData {
    const trimmed = value.trim();

    if (!trimmed) {
        throw new Error('Empty value');
    }

    let address: Address;
    let originalFlags: OriginalFlags = {
        isBounceable: null,
        isTestOnly: null,
        isSidechain: null
    };

    if (Address.isFriendly(trimmed)) {
        const parsed = Address.parseFriendly(trimmed);
        originalFlags = {
            isBounceable: parsed.isBounceable,
            isTestOnly: parsed.isTestOnly,
            isSidechain: parsed.isSidechain
        };
        address = parsed.address;
    } else {
        address = Address.parseRaw(trimmed);
    }

    const sidechainAddress = new Address(address.workChain, address.hash, 42);

    return { address, originalFlags, sidechainAddress };
}

const examples = [
    { label: 'Mainnet', value: 'Ef_lZ1T4NCb2mwkme9h2rJfESCE0W34ma9lWp7-_uY3zXDvq' },
    { label: 'Testnet', value: 'kf_BPkSoNoJxvMA1kM9gncikPodLov3jSJy4UHJ4IsulrZ1d' },
    { label: 'Raw', value: '-1:5555555555555555555555555555555555555555555555555555555555555555' },
    {
        label: 'Sidechain (chainId 42)',
        value: 'MQAAAAAqQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkI66w'
    }
];

export const AddressTEP555 = () => {
    const [value, setValue] = useState('');
    const [addressData, setAddressData] = useState<AddressData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = useCallback((nextValue: string) => {
        setValue(nextValue);

        if (!nextValue.trim()) {
            setAddressData(null);
            setError(null);
            return;
        }

        try {
            setAddressData(parseAddressValue(nextValue));
            setError(null);
        } catch {
            setAddressData(null);
            setError('Not a valid TON address');
        }
    }, []);

    return (
        <div className="address-tep-555">
            <div className="address-tep-555__header">
                <h2>
                    Address representations (
                    <a
                        href="https://github.com/ton-blockchain/TEPs/pull/555"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="address-tep-555__link"
                    >
                        TEP-555
                    </a>
                    )
                </h2>
                <p>Enter a TON address to see address flags and representations.</p>
            </div>

            <div className="address-tep-555__input-container">
                <label className="address-tep-555__input-label">TON address</label>
                <input
                    className="address-tep-555__input"
                    placeholder="Ef9VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVbxn"
                    value={value}
                    onChange={e => handleChange(e.target.value)}
                    spellCheck={false}
                />
                <label className="address-tep-555__input-label">Examples:</label>
                <div className="address-tep-555__examples">
                    {examples.map(example => (
                        <button
                            key={example.label}
                            type="button"
                            className="address-tep-555__example-button"
                            onClick={() => handleChange(example.value)}
                        >
                            {example.label}
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="address-tep-555__error">{error}</div>}

            {addressData && (
                <div className="address-tep-555__result">
                    <div className="address-tep-555__notice">
                        Address flags and different representations:
                    </div>
                    <AddressFlags
                        flags={addressData.originalFlags}
                        workchain={addressData.address.workChain}
                        chainId={addressData.sidechainAddress.chainId}
                    />
                    <AddressRow label="Hex (raw)" value={addressData.address.toRawString()} />
                    <AddressRow
                        label="not-testonly · bounceable"
                        value={addressData.address.toString({ bounceable: true })}
                    />
                    <AddressRow
                        label="not-testOnly · non-bounceable"
                        value={addressData.address.toString({ bounceable: false })}
                    />
                    <AddressRow
                        label="testonly · bounceable"
                        value={safeFriendly(addressData.address, {
                            bounceable: true,
                            testOnly: true
                        })}
                    />
                    <AddressRow
                        label="testonly · non-bounceable"
                        value={safeFriendly(addressData.address, {
                            bounceable: false,
                            testOnly: true
                        })}
                    />
                    <AddressRow
                        label="sidechain 42 · bounceable"
                        value={safeFriendly(addressData.sidechainAddress, {
                            bounceable: true
                        })}
                    />
                    <AddressRow
                        label="sidechain 42 · non-bounceable"
                        value={safeFriendly(addressData.sidechainAddress, {
                            bounceable: false
                        })}
                    />
                </div>
            )}

            {!addressData && !error && (
                <div className="address-tep-555__placeholder">
                    Enter a TON address to see its flags and representations.
                </div>
            )}
        </div>
    );
};
