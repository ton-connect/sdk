import { ConnectRequest } from '../connect-request';

export interface MakeSendActionIntentRequest {
    id: string;
    m: 'actionIntent';
    c?: ConnectRequest; // optional - see Intents section
    a: string; // action URL that the wallet will call to get the action details. The wallet MUST add the `address` query parameter to this URL (the user's wallet address). The action URL MUST respond with a JSON object containing `action_type` and `action` fields
}
