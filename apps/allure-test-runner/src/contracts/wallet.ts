import {
    Cell,
    loadMessageRelaxed,
    loadOutList,
    loadStateInit,
    type MessageRelaxed
} from '@ton/core';
import { Buffer } from 'buffer';

const walletsCodeMap = {
    v1r1: Cell.fromBoc(
        Buffer.from(
            'te6cckEBAQEARAAAhP8AIN2k8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVEH98Ik=',
            'base64'
        )
    )[0],
    v1r2: Cell.fromBoc(
        Buffer.from(
            'te6cckEBAQEAUwAAov8AIN0gggFMl7qXMO1E0NcLH+Ck8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVNDieG8=',
            'base64'
        )
    )[0],
    v1r3: Cell.fromBoc(
        Buffer.from(
            'te6cckEBAQEAXwAAuv8AIN0gggFMl7ohggEznLqxnHGw7UTQ0x/XC//jBOCk8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVLW4bkI=',
            'base64'
        )
    )[0],
    v2r1: Cell.fromBoc(
        Buffer.from(
            'te6cckEBAQEAVwAAqv8AIN0gggFMl7qXMO1E0NcLH+Ck8mCDCNcYINMf0x8B+CO78mPtRNDTH9P/0VExuvKhA/kBVBBC+RDyovgAApMg10qW0wfUAvsA6NGkyMsfy//J7VShNwu2',
            'base64'
        )
    )[0],
    v2r2: Cell.fromBoc(
        Buffer.from(
            'te6cckEBAQEAYwAAwv8AIN0gggFMl7ohggEznLqxnHGw7UTQ0x/XC//jBOCk8mCDCNcYINMf0x8B+CO78mPtRNDTH9P/0VExuvKhA/kBVBBC+RDyovgAApMg10qW0wfUAvsA6NGkyMsfy//J7VQETNeh',
            'base64'
        )
    )[0],
    v3r1: Cell.fromBoc(
        Buffer.from(
            'te6cckEBAQEAYgAAwP8AIN0gggFMl7qXMO1E0NcLH+Ck8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVD++buA=',
            'base64'
        )
    )[0],
    v3r2: Cell.fromBoc(
        Buffer.from(
            'te6cckEBAQEAcQAA3v8AIN0gggFMl7ohggEznLqxn3Gw7UTQ0x/THzHXC//jBOCk8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVBC9ba0=',
            'base64'
        )
    )[0],
    v4r1: Cell.fromBoc(
        Buffer.from(
            'B5EE9C72410215010002F5000114FF00F4A413F4BCF2C80B010201200203020148040504F8F28308D71820D31FD31FD31F02F823BBF263ED44D0D31FD31FD3FFF404D15143BAF2A15151BAF2A205F901541064F910F2A3F80024A4C8CB1F5240CB1F5230CBFF5210F400C9ED54F80F01D30721C0009F6C519320D74A96D307D402FB00E830E021C001E30021C002E30001C0039130E30D03A4C8CB1F12CB1FCBFF1112131403EED001D0D3030171B0915BE021D749C120915BE001D31F218210706C7567BD228210626C6E63BDB022821064737472BDB0925F03E002FA403020FA4401C8CA07CBFFC9D0ED44D0810140D721F404305C810108F40A6FA131B3925F05E004D33FC8258210706C7567BA9131E30D248210626C6E63BAE30004060708020120090A005001FA00F404308210706C7567831EB17080185005CB0527CF165003FA02F40012CB69CB1F5210CB3F0052F8276F228210626C6E63831EB17080185005CB0527CF1624FA0214CB6A13CB1F5230CB3F01FA02F4000092821064737472BA8E3504810108F45930ED44D0810140D720C801CF16F400C9ED54821064737472831EB17080185004CB0558CF1622FA0212CB6ACB1FCB3F9410345F04E2C98040FB000201200B0C0059BD242B6F6A2684080A06B90FA0218470D4080847A4937D29910CE6903E9FF9837812801B7810148987159F31840201580D0E0011B8C97ED44D0D70B1F8003DB29DFB513420405035C87D010C00B23281F2FFF274006040423D029BE84C600201200F100019ADCE76A26840206B90EB85FFC00019AF1DF6A26840106B90EB858FC0006ED207FA00D4D422F90005C8CA0715CBFFC9D077748018C8CB05CB0222CF165005FA0214CB6B12CCCCC971FB00C84014810108F451F2A702006C810108D718C8542025810108F451F2A782106E6F746570748018C8CB05CB025004CF16821005F5E100FA0213CB6A12CB1FC971FB00020072810108D718305202810108F459F2A7F82582106473747270748018C8CB05CB025005CF16821005F5E100FA0214CB6A13CB1F12CB3FC973FB00000AF400C9ED5446A9F34F',
            'hex'
        )
    )[0]!,
    v4r2: Cell.fromBoc(
        Buffer.from(
            'te6ccgECFAEAAtQAART/APSkE/S88sgLAQIBIAIDAgFIBAUE+PKDCNcYINMf0x/THwL4I7vyZO1E0NMf0x/T//QE0VFDuvKhUVG68qIF+QFUEGT5EPKj+AAkpMjLH1JAyx9SMMv/UhD0AMntVPgPAdMHIcAAn2xRkyDXSpbTB9QC+wDoMOAhwAHjACHAAuMAAcADkTDjDQOkyMsfEssfy/8QERITAubQAdDTAyFxsJJfBOAi10nBIJJfBOAC0x8hghBwbHVnvSKCEGRzdHK9sJJfBeAD+kAwIPpEAcjKB8v/ydDtRNCBAUDXIfQEMFyBAQj0Cm+hMbOSXwfgBdM/yCWCEHBsdWe6kjgw4w0DghBkc3RyupJfBuMNBgcCASAICQB4AfoA9AQw+CdvIjBQCqEhvvLgUIIQcGx1Z4MesXCAGFAEywUmzxZY+gIZ9ADLaRfLH1Jgyz8gyYBA+wAGAIpQBIEBCPRZMO1E0IEBQNcgyAHPFvQAye1UAXKwjiOCEGRzdHKDHrFwgBhQBcsFUAPPFiP6AhPLassfyz/JgED7AJJfA+ICASAKCwBZvSQrb2omhAgKBrkPoCGEcNQICEekk30pkQzmkD6f+YN4EoAbeBAUiYcVnzGEAgFYDA0AEbjJftRNDXCx+AA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIA4PABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AAG7SB/oA1NQi+QAFyMoHFcv/ydB3dIAYyMsFywIizxZQBfoCFMtrEszMyXP7AMhAFIEBCPRR8qcCAHCBAQjXGPoA0z/IVCBHgQEI9FHyp4IQbm90ZXB0gBjIywXLAlAGzxZQBPoCFMtqEssfyz/Jc/sAAgBsgQEI1xj6ANM/MFIkgQEI9Fnyp4IQZHN0cnB0gBjIywXLAlAFzxZQA/oCE8tqyx8Syz/Jc/sAAAr0AMntVA==',
            'base64'
        )
    )[0],
    v5beta: Cell.fromBoc(
        Buffer.from(
            'te6cckEBAQEAIwAIQgLkzzsvTG1qYeoPK1RH0mZ4WyavNjfbLe7mvNGqgm80Eg3NjhE=',
            'base64'
        )
    )[0],
    v5r1: Cell.fromBoc(
        Buffer.from(
            'b5ee9c7241021401000281000114ff00f4a413f4bcf2c80b01020120020d020148030402dcd020d749c120915b8f6320d70b1f2082106578746ebd21821073696e74bdb0925f03e082106578746eba8eb48020d72101d074d721fa4030fa44f828fa443058bd915be0ed44d0810141d721f4058307f40e6fa1319130e18040d721707fdb3ce03120d749810280b99130e070e2100f020120050c020120060902016e07080019adce76a2684020eb90eb85ffc00019af1df6a2684010eb90eb858fc00201480a0b0017b325fb51341c75c875c2c7e00011b262fb513435c280200019be5f0f6a2684080a0eb90fa02c0102f20e011e20d70b1f82107369676ebaf2e08a7f0f01e68ef0eda2edfb218308d722028308d723208020d721d31fd31fd31fed44d0d200d31f20d31fd3ffd70a000af90140ccf9109a28945f0adb31e1f2c087df02b35007b0f2d0845125baf2e0855036baf2e086f823bbf2d0882292f800de01a47fc8ca00cb1f01cf16c9ed542092f80fde70db3cd81003f6eda2edfb02f404216e926c218e4c0221d73930709421c700b38e2d01d72820761e436c20d749c008f2e09320d74ac002f2e09320d71d06c712c2005230b0f2d089d74cd7393001a4e86c128407bbf2e093d74ac000f2e093ed55e2d20001c000915be0ebd72c08142091709601d72c081c12e25210b1e30f20d74a111213009601fa4001fa44f828fa443058baf2e091ed44d0810141d718f405049d7fc8ca0040048307f453f2e08b8e14038307f45bf2e08c22d70a00216e01b3b0f2d090e2c85003cf1612f400c9ed54007230d72c08248e2d21f2e092d200ed44d0d2005113baf2d08f54503091319c01810140d721d70a00f2e08ee2c8ca0058cf16c9ed5493f2c08de20010935bdb31e1d74cd0b4d6c35e',
            'hex'
        )
    )[0]
} as const;

export type WalletVersion = keyof typeof walletsCodeMap;

export type WalletTransfer = {
    validUntil: number;
    seqno: number;
    walletId: number;
    messages: MessageRelaxed[];
};

function loadWalletTransferV3(cell: Cell): WalletTransfer {
    const cs = cell.beginParse();
    cs.skip(512); // signature
    const walletId = cs.loadUint(32);
    const validUntil = cs.loadUint(32);
    const seqno = cs.loadUint(32);
    let messages: MessageRelaxed[] = [];
    while (cs.remainingRefs) {
        const msgRef = cs.loadRef();
        messages.push(loadMessageRelaxed(msgRef.beginParse()));
    }

    return {
        walletId,
        validUntil,
        seqno,
        messages
    };
}

function loadWalletTransferV4(cell: Cell): WalletTransfer {
    const cs = cell.beginParse();
    cs.skip(512); // signature
    const walletId = cs.loadUint(32);
    const validUntil = cs.loadUint(32);
    const seqno = cs.loadUint(32);
    cs.skip(8);
    let messages: MessageRelaxed[] = [];
    while (cs.remainingRefs) {
        const msgRef = cs.loadRef();
        messages.push(loadMessageRelaxed(msgRef.beginParse()));
    }

    return {
        walletId,
        validUntil,
        seqno,
        messages
    };
}

function loadWalletTransferV5(cell: Cell): WalletTransfer {
    const cs = cell.beginParse();
    cs.skip(32); // op
    const walletId = cs.loadUint(32);
    const validUntil = cs.loadUint(32);
    const seqno = cs.loadUint(32);
    const c5Actions = cs.loadMaybeRef();
    let messages: MessageRelaxed[] = [];
    if (c5Actions) {
        const outActions = loadOutList(c5Actions.beginParse());
        for (const outAction of outActions) {
            if (outAction.type === 'sendMsg') {
                messages.push(outAction.outMsg);
            }
        }
    }

    return {
        walletId,
        validUntil,
        seqno,
        messages
    };
}

export function loadWalletTransfer(cell: Cell, version: WalletVersion): WalletTransfer {
    if (version === 'v5r1' || version === 'v5beta') {
        return loadWalletTransferV5(cell);
    }
    if (version === 'v4r2' || version === 'v4r1') {
        return loadWalletTransferV4(cell);
    }
    if (version === 'v3r2' || version === 'v3r1') {
        return loadWalletTransferV3(cell);
    }

    throw new Error(`Unsupported wallet version ${version}`);
}

export function determineWalletVersion(stateInit: string | undefined): WalletVersion | undefined {
    if (!stateInit) {
        return undefined;
    }

    try {
        const cell = Cell.fromBase64(stateInit);
        const { code } = loadStateInit(cell.beginParse());
        if (!code) {
            return undefined;
        }
        for (const [walletVersion, walletCode] of Object.entries(walletsCodeMap)) {
            if (walletCode.equals(code)) {
                return walletVersion as WalletVersion;
            }
        }
        console.error('Unknown wallet version');
        return undefined;
    } catch (e) {
        console.error('Cannot determine wallet version', e);
        return undefined;
    }
}
