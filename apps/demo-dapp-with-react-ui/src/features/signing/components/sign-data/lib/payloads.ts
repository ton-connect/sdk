import type { SignDataPayload } from '@tonconnect/ui-react';
import { beginCell } from '@ton/ton';

export type SignDataMode = 'text' | 'binary' | 'cell';

const buildText = (): SignDataPayload => ({
    type: 'text',
    text: 'I confirm this test signature request.'
});

const buildBinary = (): SignDataPayload => ({
    type: 'binary',
    bytes: Buffer.from('I confirm this test signature request.', 'ascii').toString('base64')
});

const buildCell = (): SignDataPayload => {
    const text = 'Test message in cell';
    const cell = beginCell().storeUint(text.length, 7).storeStringTail(text).endCell();
    return {
        type: 'cell',
        schema: 'message#_ len:uint7 {len <= 127} text:(bits len * 8) = Message;',
        cell: cell.toBoc().toString('base64')
    };
};

const BUILDERS: Record<SignDataMode, () => SignDataPayload> = {
    text: buildText,
    binary: buildBinary,
    cell: buildCell
};

export const defaultPayloadFor = (mode: SignDataMode): SignDataPayload => BUILDERS[mode]();

export const isSignDataMode = (value: unknown): value is SignDataMode =>
    value === 'text' || value === 'binary' || value === 'cell';
