import { Component, JSXElement } from 'solid-js';
import { InputStyled, LabelStyled, SliderStyled, TabBarStyled } from './style';
import { Styleable } from 'src/app/models/styleable';

export interface TabBarProps extends Styleable {
    tab1: JSXElement;
    tab2: JSXElement;

    selectedTabIndex: number;

    onSelectedTabIndexChange?: (index: number) => void;
}

export const TabBar: Component<TabBarProps> = props => {
    const groupName = 'tabBar' + Math.floor(Math.random() * 10000);

    return (
        <TabBarStyled class={props.class} data-tc-tab-bar="true">
            <SliderStyled right={props.selectedTabIndex === 1} />
            <LabelStyled isActive={props.selectedTabIndex === 0}>
                <InputStyled
                    type="radio"
                    name={groupName}
                    checked={props.selectedTabIndex === 0}
                    onInput={() => props.onSelectedTabIndexChange?.(0)}
                />
                {props.tab1}
            </LabelStyled>
            <LabelStyled isActive={props.selectedTabIndex === 1}>
                <InputStyled
                    type="radio"
                    checked={props.selectedTabIndex === 1}
                    name={groupName}
                    onInput={() => props.onSelectedTabIndexChange?.(1)}
                />
                {props.tab2}
            </LabelStyled>
        </TabBarStyled>
    );
};
