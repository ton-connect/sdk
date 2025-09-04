export const CUSTOM_FIELD_NAMES = {
    OPERATION_TYPE: 'Operation type'
};

export const OPERATION_TYPE = {
    SEND_TRANSACTION: 'Send transaction',
    SIGN_DATA: 'Sign data',
    CONNECT: 'Connect'
};

export type CustomField = {
    id: number;
    name: string;
    global: false;
    customField: {
        id: number;
        name: string;
        required: boolean;
        archived: boolean;
        singleSelect: boolean;
        locked: boolean;
        createdDate: number;
        lastModifiedDate: number;
        createdBy: number;
        lastModifiedBy: number;
    };
};
