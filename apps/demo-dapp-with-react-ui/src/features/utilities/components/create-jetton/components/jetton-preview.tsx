import type { FC } from 'react';

import { Logo } from '../../../../../core/components/ui/logo';
import { formatUnits } from '../../../../../core/utils/units';
import type { CreateJettonRequestDto } from '../../../../../server/dto/create-jetton-request-dto';

const formatSupply = (amount: string, decimals: number): string => {
    try {
        const formatted = formatUnits(amount, decimals);
        const [integerPart, fractionPart] = formatted.split('.');
        const withSeparators = new Intl.NumberFormat('en-US').format(BigInt(integerPart));
        return fractionPart ? `${withSeparators}.${fractionPart}` : withSeparators;
    } catch {
        return amount;
    }
};

interface JettonPreviewProps {
    jetton: CreateJettonRequestDto;
    testIdPrefix: string;
}

export const JettonPreview: FC<JettonPreviewProps> = ({ jetton, testIdPrefix }) => {
    const supply = formatSupply(jetton.amount, jetton.decimals);

    return (
        <div className="flex gap-3 rounded-lg bg-secondary p-4 mb-4" data-testid={testIdPrefix}>
            <Logo
                size={56}
                src={jetton.image_data}
                alt={jetton.name}
                fallback={jetton.symbol?.[0] ?? jetton.name?.[0]}
                data-testid={`${testIdPrefix}-image`}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-col gap-0.5">
                    <span
                        className="truncate text-base font-semibold text-foreground"
                        title={jetton.name}
                        data-testid={`${testIdPrefix}-name`}
                    >
                        {jetton.name}
                    </span>
                    <span
                        className="text-sm text-secondary-foreground"
                        data-testid={`${testIdPrefix}-symbol`}
                    >
                        {jetton.symbol}
                    </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-foreground">
                    <span>
                        Decimals:{' '}
                        <span className="text-foreground" data-testid={`${testIdPrefix}-decimals`}>
                            {jetton.decimals}
                        </span>
                    </span>
                    <span>
                        Supply:{' '}
                        <span className="text-foreground" data-testid={`${testIdPrefix}-supply`}>
                            {supply}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};
