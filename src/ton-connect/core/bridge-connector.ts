/* eslint-disable unused-imports/no-unused-vars */
export class BridgeConnector {
    constructor(private readonly bridgeUrl: string) {}

    // @ts-ignore
    public async registerSession(sessionId: string): Promise<void> {
        return Promise.resolve();
    }
}
