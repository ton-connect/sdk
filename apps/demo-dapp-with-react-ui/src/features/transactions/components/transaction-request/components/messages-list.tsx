import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/core/components/ui/button';

import type { AmountUnit, TransactionMessage } from '../../../lib/transaction-presets';
import { MessageCard } from './message-card';

interface MessagesListProps {
    messages: readonly TransactionMessage[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, field: keyof TransactionMessage, value: string) => void;
    getDisplayAmount: (index: number) => string;
    setMessageAmount: (index: number, value: string, unit: AmountUnit) => void;
    getAmountUnit: (index: number) => AmountUnit;
    setAmountUnit: (index: number, unit: AmountUnit) => void;
}

export function MessagesList({
    messages,
    onAdd,
    onRemove,
    onUpdate,
    getDisplayAmount,
    setMessageAmount,
    getAmountUnit,
    setAmountUnit
}: MessagesListProps) {
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-secondary-foreground">Messages</span>
                <Button variant="secondary" size="s" onClick={onAdd}>
                    <Plus className="size-3" />
                    Add
                </Button>
            </div>

            {messages.map((message, index) => (
                <MessageCard
                    key={index}
                    index={index}
                    message={message}
                    canRemove={messages.length > 1}
                    onRemove={() => onRemove(index)}
                    onUpdate={(field, value) => onUpdate(index, field, value)}
                    displayAmount={getDisplayAmount(index)}
                    onAmountChange={value => setMessageAmount(index, value, getAmountUnit(index))}
                    amountUnit={getAmountUnit(index)}
                    onAmountUnitChange={unit => setAmountUnit(index, unit)}
                    expanded={!!expanded[index]}
                    onToggleExpand={() => setExpanded(prev => ({ ...prev, [index]: !prev[index] }))}
                />
            ))}
        </div>
    );
}
