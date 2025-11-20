export type WalletConnectMetadata = {
    name: string;
    description: string;
    url: string;
    icons: string[];
};

export type WalletConnectOptions = {
    projectId: string;
    metadata: WalletConnectMetadata;
};
