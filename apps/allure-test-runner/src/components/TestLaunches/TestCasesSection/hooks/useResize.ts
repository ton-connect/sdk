import { useState, useRef, useCallback, useEffect } from 'react';

export function useResize(initialListWidth: string = '40%') {
    const [isResizing, setIsResizing] = useState(false);
    const [listWidth, setListWidth] = useState(initialListWidth);
    const layoutRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !layoutRef.current) return;

            const rect = layoutRef.current.getBoundingClientRect();
            const newListWidth = ((e.clientX - rect.left) / rect.width) * 100;
            const clampedWidth = Math.max(20, Math.min(80, newListWidth));
            setListWidth(`${clampedWidth}%`);
        },
        [isResizing]
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const detailsWidth = `calc(100% - ${listWidth} - 16px)`;

    return {
        isResizing,
        listWidth,
        detailsWidth,
        layoutRef,
        handleMouseDown
    };
}
