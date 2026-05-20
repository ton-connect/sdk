import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import {
    BookOpen,
    CircleDollarSign,
    ExternalLink,
    FileSignature,
    Github,
    Search,
    Send,
    Settings,
    ShieldCheck,
    Sparkles,
    TreePine,
    Wallet,
    Zap
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import type { ComponentType, FC, ReactNode } from 'react';

import { usePreserveSearch } from '@/core/hooks/use-preserve-search';
import { BalanceCard } from '@/features/wallet';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar
} from '@/core/components/sidebar';
import { AppLogo } from '../app-logo';
import { ThemeSwitcher } from '@/core/components/layout/theme-switcher';

interface LayoutProps {
    children: ReactNode;
    title?: string | ReactNode;
    subtitle?: ReactNode;
}

type NavLinkSpec = { to: string; label: string; icon: ComponentType<{ className?: string }> };

const NAV_GROUPS: readonly { label?: string; links: readonly NavLinkSpec[] }[] = [
    {
        label: 'Transactions',
        links: [
            { to: '/tx-form', label: 'Send transaction', icon: Send },
            { to: '/gasless', label: 'Gasless USDT', icon: Zap },
            { to: '/batch-limits', label: 'Batch limits', icon: Sparkles },
            { to: '/transfer-usdt', label: 'Transfer USDT', icon: CircleDollarSign }
        ]
    },
    {
        label: 'Signing',
        links: [
            { to: '/sign-data', label: 'Sign data', icon: FileSignature },
            { to: '/ton-proof', label: 'Ton proof', icon: ShieldCheck }
        ]
    },
    {
        label: 'Utilities',
        links: [
            { to: '/find-tx', label: 'Find transaction', icon: Search },
            { to: '/merkle', label: 'Merkle proof', icon: TreePine },
            { to: '/create-jetton', label: 'Create jetton', icon: Wallet }
        ]
    }
];

const EXTERNAL_LINKS: readonly {
    href: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
}[] = [
    { href: 'https://docs.ton.org/develop/dapps/ton-connect', label: 'Docs', icon: BookOpen },
    { href: 'https://github.com/ton-connect/sdk', label: 'GitHub', icon: Github }
];

const AppSidebar: FC = () => {
    const { setOpenMobile, isMobile } = useSidebar();
    const withSearch = usePreserveSearch();
    const wallet = useTonWallet();

    const closeOnMobile = () => {
        if (isMobile) setOpenMobile(false);
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <Link
                    to={withSearch('/tx-form')}
                    onClick={closeOnMobile}
                    className="flex items-center gap-2 px-2 py-1.5"
                >
                    <AppLogo className="size-7" />
                    <span className="text-base font-bold text-foreground">TON Connect Demo</span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                {wallet && (
                    <>
                        <SidebarGroup>
                            <BalanceCard />
                        </SidebarGroup>

                        <SidebarSeparator />
                    </>
                )}

                {NAV_GROUPS.map((group, i) => (
                    <SidebarGroup key={group.label ?? `group-${i}`}>
                        {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
                        <SidebarMenu>
                            {group.links.map(({ to, label, icon: Icon }) => (
                                <SidebarMenuItem key={to}>
                                    <NavLink to={withSearch(to)} end onClick={closeOnMobile}>
                                        {({ isActive }) => (
                                            <SidebarMenuButton isActive={isActive}>
                                                <Icon />
                                                <span>{label}</span>
                                            </SidebarMenuButton>
                                        )}
                                    </NavLink>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarSeparator />

            <SidebarFooter>
                <SidebarMenu>
                    {EXTERNAL_LINKS.map(({ href, label, icon: Icon }) => (
                        <SidebarMenuItem key={href}>
                            <SidebarMenuButton asChild>
                                <a href={href} target="_blank" rel="noreferrer">
                                    <Icon />
                                    <span>{label}</span>
                                    <ExternalLink className="ml-auto text-tertiary-foreground" />
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    <SidebarMenuItem>
                        <NavLink to={withSearch('/settings')} end onClick={closeOnMobile}>
                            {({ isActive }) => (
                                <SidebarMenuButton isActive={isActive}>
                                    <Settings />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            )}
                        </NavLink>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export const Layout: FC<LayoutProps> = ({ children, title, subtitle }) => {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <header
                    data-app-chrome-header
                    className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-tertiary bg-background/80 px-4 backdrop-blur"
                >
                    <AppLogo className="size-8 md:hidden" />
                    <div className="hidden text-lg font-semibold md:flex md:items-center md:justify-center">
                        {typeof title === 'string' ? <h1>{title}</h1> : title}
                    </div>

                    <div className="ml-auto">
                        <TonConnectButton />
                    </div>
                    <ThemeSwitcher />
                    <div className="md:hidden">
                        <SidebarTrigger />
                    </div>
                </header>

                <main className="mx-auto w-full max-w-4xl flex-1 p-4">
                    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-2 md:py-6">
                        <div className="flex w-full items-center justify-start md:hidden">
                            {typeof title === 'string' ? (
                                <h1 className="text-lg font-semibold">{title}</h1>
                            ) : (
                                title
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-[15px] leading-relaxed text-secondary-foreground">
                                {subtitle}
                            </p>
                        )}
                        {children}
                    </div>
                </main>

                <footer className="pb-4 pt-2 text-center text-xs text-tertiary-foreground">
                    <p>Powered by TON Connect</p>
                </footer>
            </SidebarInset>
        </SidebarProvider>
    );
};
