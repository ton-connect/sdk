/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { Slot } from 'radix-ui';
import { Button } from '../ui/button/index';

import { Separator } from '../separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../sheet';

import { useIsMobile } from '../../hooks/use-mobile';
import { cn } from '../../lib/utils';

const SIDEBAR_WIDTH = '18rem';

type SidebarContextProps = {
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

const useSidebar = () => {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider.');
    }
    return context;
};

const SidebarProvider = ({ className, style, children, ...props }: React.ComponentProps<'div'>) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    const toggleSidebar = React.useCallback(() => setOpenMobile(open => !open), []);

    const value = React.useMemo<SidebarContextProps>(
        () => ({ openMobile, setOpenMobile, isMobile, toggleSidebar }),
        [openMobile, isMobile, toggleSidebar]
    );

    return (
        <SidebarContext.Provider value={value}>
            <div
                data-slot="sidebar-wrapper"
                style={{ '--sidebar-width': SIDEBAR_WIDTH, ...style } as React.CSSProperties}
                className={cn('flex min-h-svh w-full', className)}
                {...props}
            >
                {children}
            </div>
        </SidebarContext.Provider>
    );
};

const Sidebar = ({ className, children }: React.ComponentProps<'div'>) => {
    const { isMobile, openMobile, setOpenMobile } = useSidebar();

    if (isMobile) {
        return (
            <Sheet open={openMobile} onOpenChange={setOpenMobile}>
                <SheetContent
                    side="right"
                    data-slot="sidebar"
                    className="max-w-[85vw] bg-background p-0 text-foreground [&>button]:hidden"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Sidebar</SheetTitle>
                        <SheetDescription>Sidebar navigation.</SheetDescription>
                    </SheetHeader>
                    <div className="flex h-full w-full min-w-0 flex-col overflow-x-hidden">
                        {children}
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <aside
            data-slot="sidebar"
            className={cn(
                'sticky top-0 hidden h-svh w-(--sidebar-width) shrink-0 flex-col border-r border-tertiary bg-background text-foreground md:flex',
                className
            )}
        >
            {children}
        </aside>
    );
};

const SidebarTrigger = ({ className, onClick, ...props }: React.ComponentProps<typeof Button>) => {
    const { toggleSidebar } = useSidebar();
    return (
        <Button
            data-slot="sidebar-trigger"
            size="icon"
            variant="ghost"
            className={className}
            onClick={event => {
                onClick?.(event);
                toggleSidebar();
            }}
            {...props}
        >
            <Menu className="size-5" />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    );
};

const SidebarInset = ({ className, ...props }: React.ComponentProps<'main'>) => {
    return (
        <main
            data-slot="sidebar-inset"
            className={cn('flex min-w-0 flex-1 flex-col', className)}
            {...props}
        />
    );
};

const SidebarHeader = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="sidebar-header"
            className={cn('flex flex-col gap-2 p-2', className)}
            {...props}
        />
    );
};

const SidebarFooter = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="sidebar-footer"
            className={cn('flex flex-col gap-2 p-2', className)}
            {...props}
        />
    );
};

const SidebarContent = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="sidebar-content"
            className={cn(
                'flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto',
                className
            )}
            {...props}
        />
    );
};

const SidebarGroup = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="sidebar-group"
            className={cn('flex w-full min-w-0 flex-col p-2', className)}
            {...props}
        />
    );
};

const SidebarGroupLabel = ({ className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="sidebar-group-label"
            className={cn(
                'px-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-tertiary-foreground',
                className
            )}
            {...props}
        />
    );
};

const SidebarSeparator = ({ className, ...props }: React.ComponentProps<typeof Separator>) => {
    return (
        <Separator
            data-slot="sidebar-separator"
            className={cn('bg-tertiary data-[orientation=horizontal]:w-auto', className)}
            {...props}
        />
    );
};

const SidebarMenu = ({ className, ...props }: React.ComponentProps<'ul'>) => {
    return (
        <ul
            data-slot="sidebar-menu"
            className={cn('flex w-full min-w-0 flex-col gap-1', className)}
            {...props}
        />
    );
};

const SidebarMenuItem = ({ className, ...props }: React.ComponentProps<'li'>) => {
    return <li data-slot="sidebar-menu-item" className={cn('relative', className)} {...props} />;
};

const sidebarMenuButtonClasses =
    'flex h-8 w-full items-center gap-2 overflow-hidden rounded-md px-2 py-1 text-left text-sm text-foreground outline-hidden transition-colors hover:bg-tertiary focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-tertiary data-[active=true]:font-medium [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate';

const SidebarMenuButton = ({
    asChild = false,
    isActive = false,
    className,
    ...props
}: React.ComponentProps<'button'> & {
    asChild?: boolean;
    isActive?: boolean;
}) => {
    const Comp = asChild ? Slot.Root : 'button';
    return (
        <Comp
            data-slot="sidebar-menu-button"
            data-active={isActive}
            className={cn(sidebarMenuButtonClasses, className)}
            {...props}
        />
    );
};

export {
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
};
