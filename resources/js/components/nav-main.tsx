import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

const t = 'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className={cn(t, 'text-xs font-semibold tracking-wider text-sidebar-foreground/40 uppercase')}>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            tooltip={{ children: item.title }}
                            className={cn(
                                t,
                                'group relative rounded-xl data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold',
                                'hover:bg-accent/50 hover:text-foreground',
                                'active:scale-[0.98]',
                            )}
                        >
                            <Link href={item.href} prefetch className={t}>
                                {item.icon && <item.icon className={cn(t, 'size-4')} />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
