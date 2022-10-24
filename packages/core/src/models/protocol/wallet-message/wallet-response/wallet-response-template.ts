export type WalletResponseTemplate = WalletResponseTemplateSuccess | WalletResponseTemplateError;

export interface WalletResponseTemplateSuccess {
    result: string;
    id: string;
}

export interface WalletResponseTemplateError {
    error: { code: number; message: string; data?: unknown };
    id: string;
}
