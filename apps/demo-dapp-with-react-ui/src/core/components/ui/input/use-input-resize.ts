/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useRef, useState, useLayoutEffect } from 'react';
import type { CSSProperties, RefObject } from 'react';

export type InputSize = 's' | 'm' | 'l';

export interface ResizeMetrics {
    maxFontSize: number;
    minFontSize: number;
    lineHeightRatio: number;
    parentFontSize: number;
}

export const readResizeMetrics = (
    maxSpan: HTMLSpanElement,
    minSpan: HTMLSpanElement,
    input: HTMLInputElement,
): ResizeMetrics => {
    const maxStyle = getComputedStyle(maxSpan);
    const maxFontSize = parseFloat(maxStyle.fontSize);
    const lineHeightRatio = parseFloat(maxStyle.lineHeight) / maxFontSize;

    return {
        maxFontSize,
        minFontSize: parseFloat(getComputedStyle(minSpan).fontSize),
        lineHeightRatio,
        parentFontSize: parseFloat(getComputedStyle(input.parentElement!).fontSize),
    };
};

interface UseInputResizeOptions {
    resizable?: boolean;
    contextSize: InputSize;
    value?: string | number | readonly string[];
}

interface UseInputResizeResult {
    inputRef: RefObject<HTMLInputElement | null>;
    measureMaxRef: RefObject<HTMLSpanElement | null>;
    measureMinRef: RefObject<HTMLSpanElement | null>;
    resizeStyle: CSSProperties | undefined;
    adjustSize: () => void;
}

export const useInputResize = ({ resizable, contextSize, value }: UseInputResizeOptions): UseInputResizeResult => {
    const inputRef = useRef<HTMLInputElement>(null);
    const measureMaxRef = useRef<HTMLSpanElement>(null);
    const measureMinRef = useRef<HTMLSpanElement>(null);
    const [fontSizeEm, setFontSizeEm] = useState<number | undefined>(undefined);
    const lineHeightRatioRef = useRef<number>(1.25);

    const adjustSize = () => {
        if (!resizable || !inputRef.current || !measureMaxRef.current || !measureMinRef.current) return;
        const availableWidth = inputRef.current.clientWidth;
        if (availableWidth === 0) return;

        const textWidth = measureMaxRef.current.offsetWidth;
        const { maxFontSize, minFontSize, lineHeightRatio, parentFontSize } = readResizeMetrics(
            measureMaxRef.current,
            measureMinRef.current,
            inputRef.current,
        );

        const ratio = textWidth > 0 ? availableWidth / textWidth : 1;
        const scaledPx = Math.min(maxFontSize, Math.max(minFontSize, maxFontSize * ratio));
        setFontSizeEm(scaledPx / parentFontSize);
        lineHeightRatioRef.current = lineHeightRatio;
    };

    // Re-measure when controlled value or context size changes
    useLayoutEffect(adjustSize, [resizable, contextSize, value]);

    // Re-measure on container resize (observe parent, not the input itself,
    // to avoid feedback loop when font-size change triggers ResizeObserver)
    useLayoutEffect(() => {
        const parent = inputRef.current?.parentElement;
        if (!resizable || !parent) return;
        const observer = new ResizeObserver(adjustSize);
        observer.observe(parent);
        return () => observer.disconnect();
    }, [resizable, contextSize]);

    const resizeStyle: CSSProperties | undefined =
        resizable && fontSizeEm !== undefined
            ? { fontSize: `${fontSizeEm}em`, lineHeight: lineHeightRatioRef.current }
            : undefined;

    return { inputRef, measureMaxRef, measureMinRef, resizeStyle, adjustSize };
};
