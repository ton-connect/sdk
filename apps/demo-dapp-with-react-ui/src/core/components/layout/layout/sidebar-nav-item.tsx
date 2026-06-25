import { NavLink } from 'react-router-dom';
import type { FC } from 'react';

import type { DemoNavLink } from '../../../config/demo-nav';
import { cn } from '../../../utils/cn';
import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTooltip,
    useSidebar
} from '../../shared/sidebar/index';

interface SidebarNavItemProps {
    link: DemoNavLink;
    to: string;
    onNavigate: () => void;
}

export const SidebarNavItem: FC<SidebarNavItemProps> = ({ link, to, onNavigate }) => {
    const Icon = link.icon;
    const { isMobile, open } = useSidebar();
    const collapsed = !isMobile && !open;

    return (
        <SidebarMenuItem className="group">
            <NavLink to={to} end onClick={onNavigate} title={link.label}>
                {({ isActive }) => (
                    <SidebarMenuButton
                        isActive={isActive}
                        aria-label={link.label}
                        className={cn(collapsed && 'mx-auto !w-12 justify-center !gap-0 !px-0')}
                    >
                        <Icon />
                        <span
                            className={cn(
                                'min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-out',
                                collapsed ? 'max-w-0 opacity-0' : 'max-w-48 opacity-100'
                            )}
                        >
                            {link.label}
                        </span>
                    </SidebarMenuButton>
                )}
            </NavLink>
            {collapsed ? <SidebarTooltip>{link.label}</SidebarTooltip> : null}
        </SidebarMenuItem>
    );
};
