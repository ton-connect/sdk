import React from 'react';
import './style.scss';

export type OriginalFlags = {
    isBounceable: boolean | null;
    isTestOnly: boolean | null;
    isSidechain: boolean | null;
};

type AddressFlagsProps = {
    flags: OriginalFlags;
    workchain: number;
    chainId: number | null;
};

export const AddressFlags: React.FC<AddressFlagsProps> = ({ flags, workchain, chainId }) => {
    const blocks: string[] = [];

    if (flags.isBounceable !== null) {
        blocks.push(flags.isBounceable ? 'Bounceable' : 'Non-bounceable');
    }

    if (flags.isTestOnly !== null) {
        blocks.push(flags.isTestOnly ? 'TestOnly' : 'Mainnet flag');
    }

    if (flags.isSidechain !== null && flags.isSidechain) {
        blocks.push(`Sidechain ${chainId}`);
    }

    blocks.push(`Workchain ${workchain}`);

    return (
        <div className="address-tep-555__flags">
            {blocks.map((value, index) => (
                <div className="address-tep-555__flag" key={`${value}-${index}`}>
                    {value}
                </div>
            ))}
        </div>
    );
};
