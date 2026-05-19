import {
    BorderRadius,
    Locales,
    ReturnStrategy,
    Theme,
    THEME,
    useTonConnectUI
} from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';

import { Input } from '@/core/components/ui/input';
import { Select } from '@/core/components/ui/select';
import { ChevronDownIcon } from '@/core/components/ui/icons';
import { NetworkPicker } from '@/features/network';
import { ColorsModal } from './colors-modal';

const LANG_OPTIONS = ['en', 'ru'];
const THEME_OPTIONS = [
    { value: THEME.DARK, label: 'dark' },
    { value: THEME.LIGHT, label: 'light' },
    { value: 'SYSTEM', label: 'system' }
];
const BORDER_OPTIONS = ['m', 's', 'none'];
const BOOL_OPTIONS = ['true', 'false'];

const renderTrigger = (label: string) => (
    <Select.Trigger variant="gray" size="s" borderRadius="l">
        {label}
        <ChevronDownIcon size={16} />
    </Select.Trigger>
);

export const DevPanel = () => {
    const [checkboxes, setCheckboxes] = useState([true, false, false, true, true, true]);

    const [returnStrategy, setReturnStrategy] = useState('back');
    const [skipRedirect, setSkipRedirect] = useState('ios');
    const [enableAndroidBackHandler, setEnableAndroidBackHandler] = useState(true);
    const [language, setLanguage] = useState('en');
    const [theme, setThemeOption] = useState<string>(THEME.DARK);
    const [borders, setBorders] = useState('m');

    // eslint-disable-next-line unused-imports/no-unused-vars
    const [_, setOptions] = useTonConnectUI();

    const onLangChange = (lang: string) => {
        setLanguage(lang);
        setOptions({ language: lang as Locales });
    };

    const onThemeChange = (value: string) => {
        setThemeOption(value);
        setOptions({ uiPreferences: { theme: value as Theme } });
    };

    const onBordersChange = (value: string) => {
        setBorders(value);
        setOptions({ uiPreferences: { borderRadius: value as BorderRadius } });
    };

    const onCheckboxChange = (position: number) => {
        setCheckboxes(state => state.map((item, index) => (index === position ? !item : item)));
    };

    const onEnableAndroidBackHandlerChange = (value: boolean) => {
        setEnableAndroidBackHandler(value);
    };

    const onReturnStrategyInputBlur = () => {
        if (!returnStrategy) {
            setReturnStrategy('back');
            return;
        }
        setOptions({ actionsConfiguration: { returnStrategy: returnStrategy as ReturnStrategy } });
    };

    const onSkipRedirectInputBlur = () => {
        if (!skipRedirect) {
            setSkipRedirect('ios');
            return;
        }
        setOptions({
            actionsConfiguration: {
                skipRedirectToWallet: skipRedirect as 'ios' | 'never' | 'always'
            }
        });
    };

    useEffect(() => {
        const actionValues = ['before', 'success', 'error'];
        const modals = actionValues
            .map((item, index) => (checkboxes[index] ? item : undefined))
            .filter(i => i) as ('before' | 'success' | 'error')[];
        const notifications = actionValues
            .map((item, index) => (checkboxes[index + 3] ? item : undefined))
            .filter(i => i) as ('before' | 'success' | 'error')[];

        setOptions({ actionsConfiguration: { modals, notifications } });
    }, [checkboxes]);

    useEffect(() => {
        setOptions({ enableAndroidBackHandler });
    }, [enableAndroidBackHandler]);

    return (
        <div className="flex flex-wrap items-end gap-5 text-foreground">
            <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary-foreground">network</label>
                <NetworkPicker />
            </div>
            <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary-foreground">language</label>
                <Select.Root value={language} onValueChange={onLangChange}>
                    {renderTrigger(language)}
                    <Select.Content>
                        {LANG_OPTIONS.map(opt => (
                            <Select.Item key={opt} value={opt}>
                                {opt}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary-foreground">theme</label>
                <Select.Root value={theme} onValueChange={onThemeChange}>
                    {renderTrigger(THEME_OPTIONS.find(o => o.value === theme)?.label ?? theme)}
                    <Select.Content>
                        {THEME_OPTIONS.map(opt => (
                            <Select.Item key={opt.value} value={opt.value}>
                                {opt.label}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary-foreground">borders</label>
                <Select.Root value={borders} onValueChange={onBordersChange}>
                    {renderTrigger(borders)}
                    <Select.Content>
                        {BORDER_OPTIONS.map(opt => (
                            <Select.Item key={opt} value={opt}>
                                {opt}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-xs text-secondary-foreground">android back handler</label>
                <Select.Root
                    value={enableAndroidBackHandler.toString()}
                    onValueChange={v => onEnableAndroidBackHandlerChange(v === 'true')}
                >
                    {renderTrigger(enableAndroidBackHandler.toString())}
                    <Select.Content>
                        {BOOL_OPTIONS.map(opt => (
                            <Select.Item key={opt} value={opt}>
                                {opt}
                            </Select.Item>
                        ))}
                    </Select.Content>
                </Select.Root>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-foreground">modals</span>
                {['before', 'success', 'error'].map((label, idx) => (
                    <label key={label} className="flex items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            checked={checkboxes[idx]}
                            onChange={() => onCheckboxChange(idx)}
                        />
                        {label}
                    </label>
                ))}
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-foreground">notifications</span>
                {['before', 'success', 'error'].map((label, idx) => (
                    <label key={label} className="flex items-center gap-2 text-sm text-foreground">
                        <input
                            type="checkbox"
                            checked={checkboxes[idx + 3]}
                            onChange={() => onCheckboxChange(idx + 3)}
                        />
                        {label}
                    </label>
                ))}
            </div>

            <ColorsModal />

            <div className="w-[220px]">
                <Input size="s">
                    <Input.Header>
                        <Input.Title>return strategy</Input.Title>
                    </Input.Header>
                    <Input.Field>
                        <Input.Input
                            value={returnStrategy}
                            onChange={e => setReturnStrategy(e.target.value)}
                            onBlur={onReturnStrategyInputBlur}
                        />
                    </Input.Field>
                </Input>
            </div>

            <div className="w-[220px]">
                <Input size="s">
                    <Input.Header>
                        <Input.Title>skip redirect (ios / never / always)</Input.Title>
                    </Input.Header>
                    <Input.Field>
                        <Input.Input
                            value={skipRedirect}
                            onChange={e => setSkipRedirect(e.target.value)}
                            onBlur={onSkipRedirectInputBlur}
                        />
                    </Input.Field>
                </Input>
            </div>
        </div>
    );
};
