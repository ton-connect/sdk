import {
    createActionIntent,
    createJettonTransferItem, createNftTransferItem,
    createSignDataIntent, createTonTransferItem, createTransactionIntent,
    generateIntentUrlInline
} from "./index";
import {Address, beginCell, toNano} from "@ton/core";
import {randomBytes} from "node:crypto";

const id = '365c43da7eeb2ac071c3b4da695ff8b03f055d79e5cc8aac4fef72e86e638956';
const connectRequest = {
    "manifestUrl": "https://tonconnect-demo-dapp-with-react-ui.vercel.app/tonconnect-manifest.vercel.json",
    "items": [{"name": "ton_addr" as const}, {
        "name": "ton_proof" as const,
        "payload": "dc61a65e1c975398e5f22afae15e4d8de936ea0bf897a56a770da71a96ff10f9"
    }]
};

const cell = beginCell()
    .storeUint(0, 256).storeUint(0, 256)
    .storeUint(0, 256).storeUint(0, 255)
    .endCell().toBoc().toString('base64')

const address = Address.parse('-1:5555555555555555555555555555555555555555555555555555555555555555').toString();
const amount = toNano(1).toString();

const baseOptions = {connectRequest, validUntil: Math.ceil(Date.now() / 1000), network: '-239'}

const tonTransfer = createTransactionIntent('0', [createTonTransferItem(address, amount)], baseOptions);
const tonJettonTransfer = createTransactionIntent('0', [createTonTransferItem(address, amount), createJettonTransferItem(address, amount, address)], baseOptions);
const jettonTransfer = createTransactionIntent('0', [createJettonTransferItem(address, amount, address)], baseOptions)
const jetton2Transfer = createTransactionIntent('0', [
    createJettonTransferItem(address, amount, address),
    createJettonTransferItem(address, amount, address),
], baseOptions);
const jettonTransferWith1CellPayload = createTransactionIntent('0', [createJettonTransferItem(address, amount, address, {forwardPayload:cell })], baseOptions)
const nftTransfer = createTransactionIntent('0', [createNftTransferItem(address, amount)], baseOptions)
const signDataText = createSignDataIntent(id, {type: 'text', text: 's'.repeat(333)}, {connectRequest, network: '-239'})
const signDataBinary = createSignDataIntent(id, {type: 'binary', bytes: randomBytes(246).toString('base64')}, {connectRequest, network: '-239'})
const signDataCell = createSignDataIntent(id, {type: 'cell', schema: 'a'.repeat(100), cell: cell}, {connectRequest, network: '-239'})
const action = createActionIntent(id, 'a'.repeat(365), {connectRequest})

const tonTransferUrl = generateIntentUrlInline(id, tonTransfer)
const tonJettonTransferUrl = generateIntentUrlInline(id, tonJettonTransfer)
const jettonTransferUrl = generateIntentUrlInline(id, jettonTransfer)
const jetton2TransferUrl = generateIntentUrlInline(id, jetton2Transfer)
const jettonTransferWith1CellPayloadUrl = generateIntentUrlInline(id, jettonTransferWith1CellPayload)
const nftTransferUrl = generateIntentUrlInline(id, nftTransfer)
const signDataTextUrl = generateIntentUrlInline(id, signDataText)
const signDataBinaryUrl = generateIntentUrlInline(id, signDataBinary)
const signDataCellUrl = generateIntentUrlInline(id, signDataCell)
const actionUrl = generateIntentUrlInline(id, action)


console.log(cell)
console.log(`Ton Intent, Length: ${tonTransferUrl.length}`, tonTransferUrl);
console.log(`Ton + Jetton Intent, Length: ${tonJettonTransferUrl.length}`, tonJettonTransferUrl);
console.log(`Jetton Intent, Length: ${jettonTransferUrl.length}`, jettonTransferUrl);
console.log(`2 Jetton Intent, Length: ${jetton2TransferUrl.length}`, jetton2TransferUrl);
console.log(`Jetton Intent with 1 1023 bit cell payload, Length: ${jettonTransferWith1CellPayloadUrl.length}`, jettonTransferWith1CellPayloadUrl);
console.log(`NFT Intent, Length: ${nftTransferUrl.length}`, nftTransferUrl);
console.log(`SignData Text Intent, text length 333, Length: ${signDataTextUrl.length}`, signDataTextUrl);
console.log(`SignData Binary Intent, bytes 246, Length: ${signDataBinaryUrl.length}`, signDataBinaryUrl);
console.log(`SignData Cell Intent, 1023 bit cell, 100 schema length, Length: ${signDataCellUrl.length}`, signDataCellUrl);
console.log(`Action Intent, 365 action url length, Length: ${actionUrl.length}`, actionUrl);
