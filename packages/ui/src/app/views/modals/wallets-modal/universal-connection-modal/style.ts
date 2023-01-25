import { styled } from 'solid-styled-components';
import { H2, TabBar, Text } from 'src/app/components';

export const UniversalConnectionModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 0 24px;
`;

export const TabTextStyled = styled(Text)`
    min-width: 84px;
    text-align: center;
    font-weight: 590;
`;

export const TabBarStyled = styled(TabBar)`
    margin-bottom: 22px;
`;
