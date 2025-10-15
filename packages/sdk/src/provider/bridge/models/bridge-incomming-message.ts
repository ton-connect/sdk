export type BridgeIncomingMessage = {
    from: string;
    message: string;
    traceId?: string;
};
