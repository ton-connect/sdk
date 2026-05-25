import { Address } from '@ton/core';

export interface AddressFormat {
    /** Stable id used for `key` + `data-testid` suffixes. */
    id: string;
    /** Short human label rendered as the row label. */
    label: string;
    /** Long description shown as helper text below the value (optional). */
    description: string;
    value: string;
}

/**
 * Builds the canonical address representations TonConnect dApps commonly need
 * to render side-by-side: raw `0:` form, plus the four URL-safe variants by
 * `bounceable`×`testOnly`.
 */
export const buildAddressFormats = (rawAddress: string): AddressFormat[] => {
    const address = Address.parse(rawAddress);
    return [
        {
            id: 'raw',
            label: 'Raw',
            description: 'workchain:hex',
            value: address.toRawString()
        },
        {
            id: 'eq',
            label: 'EQ',
            description: 'mainnet, bounceable',
            value: address.toString({ urlSafe: true, bounceable: true, testOnly: false })
        },
        {
            id: 'uq',
            label: 'UQ',
            description: 'mainnet, non-bounceable',
            value: address.toString({ urlSafe: true, bounceable: false, testOnly: false })
        },
        {
            id: 'kq',
            label: 'kQ',
            description: 'testnet, bounceable',
            value: address.toString({ urlSafe: true, bounceable: true, testOnly: true })
        },
        {
            id: '0q',
            label: '0Q',
            description: 'testnet, non-bounceable',
            value: address.toString({ urlSafe: true, bounceable: false, testOnly: true })
        }
    ];
};
