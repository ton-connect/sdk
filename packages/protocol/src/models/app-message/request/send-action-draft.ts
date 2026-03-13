export interface RawActionDraftRequest {
    id: string;
    method: 'actionDraft';
    params: {
        url: string;
    };
}
