import { useState, useEffect } from 'react';

export function useStepDropdown() {
    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ x: number; y: number } | null>(null);

    const handleDropdownToggle = (stepIndex: number, event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation();
            event.preventDefault();

            setDropdownPosition({
                x: 0,
                y: 25
            });
        }

        setOpenDropdown(openDropdown === stepIndex ? null : stepIndex);
    };

    const closeDropdown = () => {
        setOpenDropdown(null);
        setDropdownPosition(null);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdown !== null) {
                const target = event.target as HTMLElement;
                if (!target.closest('.testcase-steps__dropdown')) {
                    closeDropdown();
                }
            }
        };

        if (openDropdown !== null) {
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [openDropdown]);

    return {
        openDropdown,
        dropdownPosition,
        handleDropdownToggle,
        closeDropdown
    };
}
