import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import React, { useState } from 'react';
import ReactJson from 'react-json-view';
import './style.scss';
import { CreateJettonRequestDto } from '../../server/dto/create-jetton-request-dto';
import { TonProofDemoApi } from '../../TonProofDemoApi';

const jetton: CreateJettonRequestDto = {
    name: 'Joint Photographic Experts Group',
    description:
        'JPEG is a commonly used method of lossy compression for digital images, particularly for those images produced by digital photography. The degree of compression can be adjusted, allowing a selectable tradeoff between storage size and image quality.',
    image_data:
        'data:image/png;base64,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',
    symbol: 'JPEG',
    decimals: 9,
    amount: '1000000000000000'
};

export const CreateJettonDemo = () => {
    const [data, setData] = useState({});
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    const handleClick = async () => {
        const response = await TonProofDemoApi.createJetton(jetton);

        setData(response);

        if (!('error' in response)) {
            await tonConnectUI.sendTransaction(response);
        }
    };

    return (
        <div className="create-jetton-demo">
            <h3>Create Jetton</h3>
            {wallet ? (
                <button onClick={handleClick}>Send create jetton</button>
            ) : (
                <div className="ton-proof-demo__error">Connect wallet to send transaction</div>
            )}
            {data && Object.keys(data).length > 0 && (
                <>
                    <div className="find-transaction-demo__json-label">Response</div>
                    <div className="find-transaction-demo__json-view">
                        <ReactJson src={data} name={false} theme="ocean" collapsed={false} />
                    </div>
                </>
            )}
        </div>
    );
};
