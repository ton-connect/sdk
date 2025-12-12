import React from 'react';
import './style.scss';

type AddressRowProps = {
    label: string;
    value: string | null;
};

export const AddressRow: React.FC<AddressRowProps> = ({ label, value }) => {
    return (
        <div className="address-tep-555__row">
            <div className="address-tep-555__row-label">{label}</div>
            <div className="address-tep-555__row-value">
                {value ?? <span className="address-tep-555__row-value-empty">Not available</span>}
            </div>
        </div>
    );
};
