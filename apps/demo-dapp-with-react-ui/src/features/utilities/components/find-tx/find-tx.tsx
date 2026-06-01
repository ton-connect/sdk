import { useEffect, useRef } from 'react';

import { Button } from '../../../../core/components/ui/button/index';
import { Input } from '../../../../core/components/ui/input/index';
import { Textarea } from '../../../../core/components/ui/textarea/index';
import { Select } from '../../../../core/components/ui/select/index';
import { ChevronDownIcon } from '../../../../core/components/ui/icons/index';
import { ResultBlock } from '../../../../core/components/shared/result-block/index';

import { useFindTransaction } from './hooks/use-find-transaction';

export const FindTx = () => {
    const {
        boc,
        setBoc,
        network,
        setNetwork,
        loading,
        result,
        bocError,
        findTransaction,
        clearResult,
        canSearch
    } = useFindTransaction();

    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!result || !resultRef.current) return;
        const rect = resultRef.current.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [result]);

    return (
        <div className="flex w-full flex-col gap-4" data-testid="find-tx">
            <Input size="s" error={Boolean(bocError)} data-testid="find-tx-boc-field">
                <Input.Header>
                    <Input.Title data-testid="find-tx-boc-title">
                        External-in message BOC
                    </Input.Title>
                </Input.Header>
                <Textarea
                    value={boc}
                    onChange={e => {
                        setBoc(e.target.value);
                        clearResult();
                    }}
                    rows={4}
                    placeholder="Paste base64 BOC"
                    error={Boolean(bocError)}
                    className="font-mono text-sm break-all"
                    data-testid="find-tx-boc-input"
                />
                {bocError ? (
                    <Input.Caption data-testid="find-tx-boc-error">{bocError}</Input.Caption>
                ) : null}
            </Input>

            <div className="flex w-full flex-col gap-1" data-testid="find-tx-network-field">
                <span
                    className="text-[15px] font-medium tracking-[0.01em] text-secondary-foreground"
                    data-testid="find-tx-network-label"
                >
                    Network
                </span>
                <Select.Root value={network} onValueChange={v => setNetwork(v as typeof network)}>
                    <Select.Trigger
                        variant="gray"
                        size="l"
                        borderRadius="l"
                        fullWidth
                        className="!justify-between"
                        data-testid="find-tx-network-trigger"
                    >
                        <span className="truncate text-left capitalize">{network}</span>
                        <ChevronDownIcon size={20} className="shrink-0" />
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Item value="mainnet" data-testid="find-tx-network-item-mainnet">
                            Mainnet
                        </Select.Item>
                        <Select.Item value="testnet" data-testid="find-tx-network-item-testnet">
                            Testnet
                        </Select.Item>
                    </Select.Content>
                </Select.Root>
            </div>

            <Button
                size="l"
                fullWidth
                onClick={() => void findTransaction()}
                loading={loading}
                disabled={!canSearch}
                data-testid="find-tx-search-button"
            >
                Find transaction
            </Button>

            {result && (
                <ResultBlock
                    ref={resultRef}
                    title="Transaction"
                    result={result}
                    onDismiss={clearResult}
                    testIdPrefix="find-tx-result"
                />
            )}
        </div>
    );
};
