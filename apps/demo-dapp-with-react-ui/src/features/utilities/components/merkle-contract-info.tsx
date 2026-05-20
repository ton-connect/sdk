import { CopyButton } from '../../../core/components/ui/copy-button/index';
import { InfoBlock } from '../../../core/components/ui/info-block';
import { truncateAddress } from '../../../core/lib/truncate-address';

import { MERKLE_EXAMPLE_ADDRESS } from '../lib/merkle-demo-constants';

export function MerkleContractInfo() {
    return (
        <InfoBlock.Container data-testid="merkle-contract-info">
            <InfoBlock.Row data-testid="merkle-contract-address-row">
                <InfoBlock.Label className="shrink-0">Example contract</InfoBlock.Label>
                <div className="flex min-w-0 items-center gap-1">
                    <InfoBlock.Value
                        className="min-w-0 truncate font-mono"
                        data-testid="merkle-contract-address-value"
                    >
                        {truncateAddress(MERKLE_EXAMPLE_ADDRESS)}
                    </InfoBlock.Value>
                    <CopyButton
                        className="h-5 w-5 shrink-0"
                        value={MERKLE_EXAMPLE_ADDRESS}
                        aria-label="Copy contract address"
                        data-testid="merkle-contract-address-copy"
                        iconSize={11}
                    />
                </div>
            </InfoBlock.Row>
        </InfoBlock.Container>
    );
}
