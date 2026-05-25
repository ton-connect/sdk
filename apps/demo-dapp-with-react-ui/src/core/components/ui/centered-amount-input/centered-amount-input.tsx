import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentProps, FC } from 'react';

import { cn } from '../../../utils/cn';

const MIN_FONT_SCALE = 0.5;

const INPUT_XL = 'text-[60px] font-bold leading-[68px]';
const INPUT_XL_SYMBOL = 'text-[40px] font-bold leading-none';

export interface CenteredAmountInputProps extends ComponentProps<'div'> {
    value: string;
    onValueChange: (value: string) => void;
    ticker?: string;
    symbol?: string;
    placeholder?: string;
    disabled?: boolean;
    align?: 'start' | 'center';
}

export const CenteredAmountInput: FC<CenteredAmountInputProps> = ({
    value,
    onValueChange,
    ticker,
    symbol,
    placeholder = '0',
    disabled,
    align = 'center',
    className,
    ...props
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const measureRowRef = useRef<HTMLDivElement>(null);
    const mirrorRef = useRef<HTMLSpanElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputWidth, setInputWidth] = useState<number | undefined>(undefined);
    const [fontScale, setFontScale] = useState(1);

    const adjustSize = useCallback(() => {
        const wrapper = wrapperRef.current;
        const measureRow = measureRowRef.current;
        const mirror = mirrorRef.current;

        if (!wrapper || !measureRow || !mirror) return;

        const contentWidth = measureRow.offsetWidth;
        const availableWidth = wrapper.clientWidth - 4;

        let scale = 1;
        if (contentWidth > 0 && contentWidth > availableWidth) {
            scale = Math.max(MIN_FONT_SCALE, availableWidth / contentWidth);
        }

        setFontScale(scale);
        setInputWidth(mirror.offsetWidth * scale + 4);
    }, []);

    useLayoutEffect(adjustSize, [value, placeholder, symbol, ticker, adjustSize]);

    useLayoutEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const observer = new ResizeObserver(adjustSize);
        observer.observe(wrapper);
        return () => observer.disconnect();
    }, [adjustSize]);

    const scaledInputFontSize =
        fontScale < 1 ? `calc(var(--ta-input-xl-size) * ${fontScale})` : undefined;
    const scaledTickerFontSize =
        fontScale < 1 ? `calc(var(--ta-input-xl-symbol-size) * ${fontScale})` : undefined;

    return (
        <div
            ref={wrapperRef}
            className={cn(
                'relative flex w-full cursor-text flex-col overflow-hidden',
                align === 'center' ? 'items-center' : 'items-start',
                className
            )}
            onClick={() => inputRef.current?.focus()}
            {...props}
        >
            <div
                ref={measureRowRef}
                className="pointer-events-none invisible absolute flex items-baseline whitespace-nowrap"
                aria-hidden="true"
            >
                {symbol && (
                    <span
                        className={cn(
                            INPUT_XL,
                            'select-none whitespace-nowrap text-tertiary-foreground'
                        )}
                    >
                        {symbol}
                    </span>
                )}
                <span className={INPUT_XL}>{value || placeholder}</span>
                {ticker && (
                    <span
                        className={cn(
                            INPUT_XL_SYMBOL,
                            'ml-[0.2em] select-none whitespace-nowrap text-secondary-foreground'
                        )}
                    >
                        {ticker}
                    </span>
                )}
            </div>

            <div className="flex max-w-full items-baseline">
                {symbol && (
                    <span
                        className={cn(
                            INPUT_XL,
                            'select-none whitespace-nowrap text-tertiary-foreground'
                        )}
                        style={{ fontSize: scaledInputFontSize }}
                    >
                        {symbol}
                    </span>
                )}
                <input
                    ref={inputRef}
                    className={cn(
                        INPUT_XL,
                        'box-content min-w-6 max-w-full border-none bg-transparent p-0 text-foreground outline-none placeholder:text-secondary-foreground placeholder:opacity-100',
                        align === 'center' ? 'text-right' : 'text-left'
                    )}
                    type="text"
                    inputMode="decimal"
                    placeholder={placeholder}
                    value={value}
                    disabled={disabled}
                    onChange={e => onValueChange(e.target.value)}
                    style={{
                        width: inputWidth ? `${inputWidth}px` : undefined,
                        fontSize: scaledInputFontSize
                    }}
                />
                {ticker && (
                    <span
                        className={cn(
                            INPUT_XL_SYMBOL,
                            'ml-[0.2em] select-none whitespace-nowrap text-secondary-foreground'
                        )}
                        style={{ fontSize: scaledTickerFontSize }}
                    >
                        {ticker}
                    </span>
                )}
            </div>

            <span
                ref={mirrorRef}
                className={cn(INPUT_XL, 'pointer-events-none invisible absolute whitespace-nowrap')}
                aria-hidden="true"
            >
                {value || placeholder}
            </span>
        </div>
    );
};
