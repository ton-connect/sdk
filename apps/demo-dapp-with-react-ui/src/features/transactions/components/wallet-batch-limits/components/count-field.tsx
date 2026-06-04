import type { FC } from 'react';

import { Button } from '../../../../../core/components/ui/button';
import { Input } from '../../../../../core/components/ui/input';
import { useIntegerInputDraft } from '../../../../../core/hooks/use-integer-input-draft';

import {
    BATCH_MESSAGE_COUNT_MAX,
    BATCH_MESSAGE_COUNT_WALLET_HINT,
    isBatchMessageCountCommittable
} from '../constants';

interface CountFieldProps {
    count: number;
    onChange: (next: number) => void;
    errorMessage?: string;
    warningMessage?: string;
}

const PRESETS = [1, 4, 5, 255, 256];

const parseDraftCount = (draft: string): number | undefined => {
    if (draft === '' || !/^\d+$/.test(draft)) {
        return undefined;
    }
    return Number(draft);
};

export const CountField: FC<CountFieldProps> = ({
    count,
    onChange,
    errorMessage,
    warningMessage
}) => {
    const input = useIntegerInputDraft(
        count,
        next => {
            if (next !== undefined) {
                onChange(next);
            }
        },
        {
            commitOnChange: false,
            shouldCommit: isBatchMessageCountCommittable
        }
    );

    const draftCount = parseDraftCount(input.value);
    const draftExceedsMax =
        draftCount !== undefined && draftCount > BATCH_MESSAGE_COUNT_MAX;
    const draftBelowMin = draftCount !== undefined && draftCount < 1;
    const showDraftError = draftExceedsMax || draftBelowMin;

    const draftError = draftExceedsMax
        ? `Must be at most ${BATCH_MESSAGE_COUNT_MAX}`
        : draftBelowMin
          ? 'Must be at least 1'
          : undefined;

    const draftWarning =
        !showDraftError &&
        draftCount !== undefined &&
        draftCount > BATCH_MESSAGE_COUNT_WALLET_HINT &&
        draftCount <= BATCH_MESSAGE_COUNT_MAX
            ? `Exceeds maxMessages (${BATCH_MESSAGE_COUNT_WALLET_HINT}) on all known TON Connect wallets`
            : undefined;

    const captionError = showDraftError ? draftError : errorMessage;
    const captionWarning = !captionError ? (draftWarning ?? warningMessage) : undefined;

    return (
        <Input size="s" error={Boolean(captionError)} data-testid="batch-limits-count-field">
            <Input.Header>
                <Input.Title data-testid="batch-limits-count-title">Message count</Input.Title>
            </Input.Header>
            <Input.Field>
                <Input.Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={input.value}
                    onChange={input.onChange}
                    onBlur={input.onBlur}
                    data-testid="batch-limits-count-input"
                />
            </Input.Field>

            <div className="mb-3 flex flex-wrap gap-2 pt-1">
                {PRESETS.map(preset => (
                    <Button
                        key={preset}
                        variant="bezeled"
                        size="xs"
                        onClick={() => onChange(preset)}
                        data-testid={`batch-limits-count-preset-${preset}`}
                    >
                        {preset}
                    </Button>
                ))}
            </div>

            {captionError ? (
                <p className="text-sm text-error" data-testid="batch-limits-count-error">
                    {captionError}
                </p>
            ) : captionWarning ? (
                <p className="text-sm text-[#f5a73b]" data-testid="batch-limits-count-warning">
                    {captionWarning}
                </p>
            ) : null}
        </Input>
    );
};
