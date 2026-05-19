import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';

import { Button } from '@/core/components/ui/button';
import { Collapsible } from '@/core/components/ui/collapsible';
import { Input } from '@/core/components/ui/input';
import { Select } from '@/core/components/ui/select';
import { Textarea } from '@/core/components/ui/textarea';
import { ChevronDownIcon } from '@/core/components/ui/icons';

import type { AmountUnit, TransactionMessage } from '../../../lib/transaction-presets';

interface MessageCardProps {
    index: number;
    message: TransactionMessage;
    canRemove: boolean;
    onRemove: () => void;
    onUpdate: (field: keyof TransactionMessage, value: string) => void;
    displayAmount: string;
    onAmountChange: (value: string) => void;
    amountUnit: AmountUnit;
    onAmountUnitChange: (unit: AmountUnit) => void;
    expanded: boolean;
    onToggleExpand: () => void;
}

export function MessageCard({
    index,
    message,
    canRemove,
    onRemove,
    onUpdate,
    displayAmount,
    onAmountChange,
    amountUnit,
    onAmountUnitChange,
    expanded,
    onToggleExpand
}: MessageCardProps) {
    const hasContent = !!message.payload || !!message.stateInit;
    const isOpen = hasContent || expanded;

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-tertiary p-3">
            <div className="flex items-center justify-between">
                <span className="font-medium mb-2">Message {index + 1}</span>
                {canRemove && (
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove message"
                        onClick={onRemove}
                    >
                        <Trash2 className="size-3" />
                    </Button>
                )}
            </div>

            <Input size="s">
                <Input.Header>
                    <Input.Title>Address</Input.Title>
                </Input.Header>

                <Input.Field>
                    <Input.Input
                        value={message.address}
                        onChange={e => onUpdate('address', e.target.value)}
                        placeholder="Recipient address"
                    />
                </Input.Field>
            </Input>

            <Input size="s">
                <Input.Header>
                    <Input.Title>Amount</Input.Title>
                </Input.Header>
                <div className="flex w-full gap-2">
                    <Input.Field className="w-full">
                        <Input.Input
                            value={displayAmount}
                            onChange={e => onAmountChange(e.target.value)}
                            placeholder={amountUnit === 'TON' ? '0.001' : '1000000'}
                        />
                    </Input.Field>
                    <Select.Root
                        value={amountUnit}
                        onValueChange={v => onAmountUnitChange(v as AmountUnit)}
                    >
                        <Select.Trigger variant="gray" size="s" borderRadius="l">
                            {amountUnit}
                            <ChevronDownIcon size={14} />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Item value="TON">TON</Select.Item>
                            <Select.Item value="nano">nano</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </div>
            </Input>

            <Collapsible open={isOpen} onOpenChange={() => !hasContent && onToggleExpand()}>
                <Collapsible.Trigger className={hasContent ? 'cursor-default' : ''}>
                    {isOpen ? (
                        <ChevronDown className="size-4" />
                    ) : (
                        <ChevronRight className="size-4" />
                    )}
                    Payload, State Init
                </Collapsible.Trigger>

                <Collapsible.Content className="flex flex-col gap-2 pt-2">
                    <Input size="s">
                        <Input.Header>
                            <Input.Title>Payload</Input.Title>
                        </Input.Header>
                        <Textarea
                            value={message.payload ?? ''}
                            onChange={e => onUpdate('payload', e.target.value)}
                            placeholder="Transaction payload (base64)"
                            rows={2}
                        />
                    </Input>

                    <Input size="s">
                        <Input.Header>
                            <Input.Title>State Init</Input.Title>
                        </Input.Header>
                        <Textarea
                            value={message.stateInit ?? ''}
                            onChange={e => onUpdate('stateInit', e.target.value)}
                            placeholder="State init (base64)"
                            rows={2}
                        />
                    </Input>
                </Collapsible.Content>
            </Collapsible>
        </div>
    );
}
