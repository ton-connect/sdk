import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/core/components/ui/button';

import type { AmountUnit, TransactionMessage } from '../../../lib/transaction-presets';
import { MessageCard } from './message-card';

interface MessagesListProps {
    messages: readonly TransactionMessage[];
    onAdd: () => void;
    onRemove: (id: string) => void;
    onUpdate: (id: string, field: keyof TransactionMessage, value: string) => void;
    getDisplayAmount: (id: string) => string;
    setMessageAmount: (id: string, value: string, unit: AmountUnit) => void;
    getAmountUnit: (id: string) => AmountUnit;
    setAmountUnit: (id: string, unit: AmountUnit) => void;
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
    // `undefined` for a message id means "no explicit choice yet"; MessageCard
    // then falls back to auto-open if there's payload/stateInit content.
    const [expanded, setExpanded] = useState<Record<string, boolean | undefined>>({});

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-md font-bold">Messages</span>
                <Button variant="secondary" size="s" onClick={onAdd}>
                    <Plus className="size-3.5" />
                    Add message
                </Button>
            </div>

            {messages.map((message, index) => (
                <MessageCard
                    key={message.id}
                    index={index}
                    message={message}
                    canRemove={messages.length > 1}
                    onRemove={() => onRemove(message.id)}
                    onUpdate={(field, value) => onUpdate(message.id, field, value)}
                    displayAmount={getDisplayAmount(message.id)}
                    onAmountChange={value =>
                        setMessageAmount(message.id, value, getAmountUnit(message.id))
                    }
                    amountUnit={getAmountUnit(message.id)}
                    onAmountUnitChange={unit => setAmountUnit(message.id, unit)}
                    expanded={expanded[message.id]}
                    onExpandedChange={open =>
                        setExpanded(prev => ({ ...prev, [message.id]: open }))
                    }
                />
            ))}
        </div>
    );
}
