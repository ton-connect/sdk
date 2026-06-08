/** Demo dapp location after merge into https://github.com/ton-connect/sdk */
const REPO = 'https://github.com/ton-connect/sdk';
const BRANCH = 'main';
const ROOT = 'apps/demo-dapp-with-react-ui';

const demoSource = (path: string): string => `${REPO}/tree/${BRANCH}/${ROOT}/${path}`;

/** GitHub tree links to feature source in the monorepo demo app. */
export const DEMO_SOURCE_LINKS = {
    sendTransaction: demoSource('src/features/transactions/components/send-transaction'),
    signData: demoSource('src/features/signing/components/sign-data'),
    signMessage: demoSource('src/features/transactions/components/sign-message'),
    transferUsdt: demoSource('src/features/transactions/components/transfer-usdt'),
    merkle: demoSource('src/features/utilities/components/merkle'),
    createJetton: demoSource('src/features/utilities/components/create-jetton'),
    tonProof: demoSource('src/features/signing/components/ton-proof'),
    findTx: demoSource('src/features/utilities/components/find-tx'),
    batchLimits: demoSource('src/features/transactions/components/wallet-batch-limits')
} as const;
