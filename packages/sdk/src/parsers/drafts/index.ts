import { DraftMethod } from 'src/models/methods/drafts';
import { DraftParser } from './draft-parser';
import { sendTransactionDraftParser } from './send-transaction-draft-parser';
import { signDataDraftParser } from './sign-data-draft-parser';
import { signMessageDraftParser } from './sign-message-draft-parser';
import { sendActionDraftParser } from './send-action-draft-parser';

export { DraftParser, DraftSerializeParams } from './draft-parser';
export { sendTransactionDraftParser } from './send-transaction-draft-parser';
export { signDataDraftParser } from './sign-data-draft-parser';
export { signMessageDraftParser } from './sign-message-draft-parser';
export { sendActionDraftParser } from './send-action-draft-parser';

export const draftParsers: { [M in DraftMethod]: DraftParser<M> } = {
    sendTransaction: sendTransactionDraftParser,
    signData: signDataDraftParser,
    signMessage: signMessageDraftParser,
    sendAction: sendActionDraftParser
};
