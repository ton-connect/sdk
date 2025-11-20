/**
 * Metadata information about your application that will be displayed to users during WalletConnect pairing.
 */
export type WalletConnectMetadata = {
    /**
     * The name of your application.
     * @example 'My DApp'
     */
    name: string;

    /**
     * A brief description of your application.
     * @example 'My awesome TON DApp'
     */
    description: string;

    /**
     * The URL of your application. This is used as the domain for ton_proof authentication.
     * @example 'https://mydapp.com'
     */
    url: string;

    /**
     * An array of icon URLs representing your application. These icons are shown in wallet interfaces.
     * @example ['https://mydapp.com/icon-192.png', 'https://mydapp.com/icon-512.png']
     */
    icons: string[];
};

/**
 * Configuration options for initializing WalletConnect integration.
 */
export type WalletConnectOptions = {
    /**
     * Your WalletConnect project ID. Get one at https://dashboard.reown.com/
     * @example 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
     */
    projectId: string;

    /**
     * Metadata about your application that will be displayed to users.
     */
    metadata: WalletConnectMetadata;
};
