import { RawBaseDraftPayload } from './base-draft-payload';

export interface RawActionDraftRequest extends RawBaseDraftPayload {
    /**
     * Must be set to `actionDraft`.
     */
    m: 'actionDraft';

    /**
     * Action URL that the wallet should call.
     * The wallet should call with `address={user_address}` query parameter.
     */
    a: string;
}
