import { SignDataResponse } from '../sign-data';
import { SendTransactionResponse } from '../send-transaction';

export type MakeSendActionIntentResponse = SignDataResponse | SendTransactionResponse;
