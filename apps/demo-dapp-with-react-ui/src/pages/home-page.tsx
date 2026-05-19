import { Layout } from '@/core/components';
import {
    GaslessDemo,
    TransferUsdt,
    TxForm,
    WalletBatchLimitsTester
} from '@/features/transactions';
import { SignDataTester, TonProofDemo } from '@/features/signing';
import { CreateJettonDemo, FindTransactionDemo, MerkleExample } from '@/features/utilities';

export const HomePage = () => {
    return (
        <Layout>
            <TxForm />
            <GaslessDemo />
            <WalletBatchLimitsTester />
            <SignDataTester />
            <TransferUsdt />
            <CreateJettonDemo />
            <TonProofDemo />
            <FindTransactionDemo />
            <MerkleExample />
        </Layout>
    );
};
