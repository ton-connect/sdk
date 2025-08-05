import {BorderRadius, Locales, ReturnStrategy, Theme, THEME, useTonConnectUI} from "@tonconnect/ui-react";
import './footer.scss';
import {useEffect, useState} from "react";
import {ColorsModal} from "./ColorsModal/ColorsModal";

const defaultWalletsSelectValue = '["Tonkeeper", "OpenMask"]';

export const Footer = () => {
    const [checkboxes, setCheckboxes] = useState(
        [true, false, false, true, true, true]
    );

    const [returnStrategy, setReturnStrategy] = useState('back');
    const [skipRedirect, setSkipRedirect] = useState('ios');
    const [enableAndroidBackHandler, setEnableAndroidBackHandler] = useState(true);

    const [_, setOptions] = useTonConnectUI();

    const onLangChange = (lang: string) => {
        setOptions({language: lang as Locales})
    }

    const onThemeChange = (theme: string) => {
        setOptions({uiPreferences: {theme: theme as Theme}})
    }

    const onBordersChange = (borders: string) => {
        setOptions({uiPreferences: {borderRadius: borders as BorderRadius}})
    }

    const onCheckboxChange = (position: number) => {
        setCheckboxes(state => state.map((item, index) => index === position ? !item : item ));
    }

    const onEnableAndroidBackHandlerChange = (value: boolean) => {
        setEnableAndroidBackHandler(value);
    }

    const onReturnStrategyInputBlur = () => {
        if (!returnStrategy) {
            setReturnStrategy('back');
            return;
        }

        setOptions({ actionsConfiguration: { returnStrategy: returnStrategy as ReturnStrategy } })

    }

    const onSkipRedirectInputBlur = () => {
        if (!skipRedirect) {
            setSkipRedirect('ios');
            return;
        }

        setOptions({ actionsConfiguration: { skipRedirectToWallet: skipRedirect as 'ios' | 'never' | 'always' } })

    }

    useEffect(() => {
        const actionValues = ['before', 'success', 'error'];
        const modals = actionValues.map((item, index) => checkboxes[index] ? item : undefined).filter(i => i) as ("before" | "success" | "error")[];
        const notifications = actionValues.map((item, index) => checkboxes[index + 3] ? item : undefined).filter(i => i) as ("before" | "success" | "error")[];

        setOptions({ actionsConfiguration: { modals, notifications } })
    }, [checkboxes])

    useEffect(() => {
        setOptions({ enableAndroidBackHandler });
    }, [enableAndroidBackHandler]);

    return <footer className="footer">
        <div>
            <label>language</label>
            <select onChange={e => onLangChange(e.target.value)}>
                <option value="en">en</option>
                <option value="ru">ru</option>
            </select>
        </div>

        <div>
            <label>theme</label>
            <select onChange={e => onThemeChange(e.target.value)}>
                <option value={THEME.DARK}>dark</option>
                <option value={THEME.LIGHT}>light</option>
                <option value="SYSTEM">system</option>
            </select>
        </div>

        <div>
            <label>borders</label>
            <select onChange={e => onBordersChange(e.target.value)}>
                <option value="m">m</option>
                <option value="s">s</option>
                <option value="none">none</option>
            </select>
        </div>

        <div>
            <label>enable android back handler</label>
            <select
                onChange={e => onEnableAndroidBackHandlerChange(e.target.value === 'true')}
                value={enableAndroidBackHandler.toString()}
            >
                <option value="true">true</option>
                <option value="false">false</option>
            </select>
        </div>

        <div className="footer-checkbox-container">
            <span>modals</span>
            <label>
                before
                <input type="checkbox" checked={checkboxes[0]} onChange={() => onCheckboxChange(0)}/>
            </label>
            <label>
                success
                <input type="checkbox" checked={checkboxes[1]} onChange={() => onCheckboxChange(1)}/>
            </label>
            <label>
                error
                <input type="checkbox" checked={checkboxes[2]} onChange={() => onCheckboxChange(2)}/>
            </label>
        </div>

        <div className="footer-checkbox-container">
            <span>notifications</span>
            <label>
                before
                <input type="checkbox" checked={checkboxes[3]} onChange={() => onCheckboxChange(3)}/>
            </label>
            <label>
                success
                <input type="checkbox" checked={checkboxes[4]} onChange={() => onCheckboxChange(4)}/>
            </label>
            <label>
                error
                <input type="checkbox" checked={checkboxes[5]} onChange={() => onCheckboxChange(5)}/>
            </label>
        </div>

        <div>
            <ColorsModal />
        </div>

        <div>
            <label>
                return strategy:
                <input
                    style={{ width: '200px' }}
                    value={returnStrategy}
                    onChange={e => setReturnStrategy(e.target.value)} onBlur={onReturnStrategyInputBlur}
                />
            </label>
        </div>

        <div>
            <label>
                <div>
                skip redirect to wallet:
                </div>
                <div>
                    ('ios', 'never', 'always')
                </div>
                <input
                    style={{ width: '200px' }}
                    value={skipRedirect}
                    onChange={e => setSkipRedirect(e.target.value)} onBlur={onSkipRedirectInputBlur}
                />
            </label>
        </div>
    </footer>
}
