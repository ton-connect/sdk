import { NavLink } from 'react-router-dom';
import type { FC } from 'react';

import type { DemoNavLink } from '../../../config/demo-nav';
import { SidebarMenuButton, SidebarMenuItem } from '../../shared/sidebar/index';

interface SidebarNavItemProps {
    link: DemoNavLink;
    to: string;
    onNavigate: () => void;
}

export const SidebarNavItem: FC<SidebarNavItemProps> = ({ link, to, onNavigate }) => {
    const Icon = link.icon;

    return (
        <SidebarMenuItem>
            <NavLink to={to} end onClick={onNavigate}>
                {({ isActive }) => (
                    <SidebarMenuButton isActive={isActive}>
                        <Icon />
                        <span>{link.label}</span>
                    </SidebarMenuButton>
                )}
            </NavLink>
        </SidebarMenuItem>
    );
};
