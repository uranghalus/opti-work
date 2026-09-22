import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Boxes, CalendarCheck2, CalendarClock, ClipboardList, FileText, FolderGit2, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as inventoriesIndex } from '@/routes/inventory';
import { index as workDailyIndex } from '@/routes/work-daily';
import { index as workDataIndex } from '@/routes/work-data';
import { index as workOrdersIndex } from '@/routes/work-orders';
import { index as workPlanningIndex } from '@/routes/work-planning';
import type { NavItem } from '@/types';


const footerNavItems: NavItem[] = [
    { title: 'Repository', href: 'https://github.com/laravel/react-starter-kit', icon: FolderGit2 },
    { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits#react', icon: BookOpen },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    const permissions: string[] = auth.permissions ?? [];

    const can = (permission: string): boolean => permissions.includes(permission);

    // Menu modul hanya tampil untuk role yang memiliki permission .read terkait (FR-30)
    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        ...(can('work-order.read') ? [{ title: 'Work Orders', href: workOrdersIndex(), icon: ClipboardList }] : []),
        ...(can('work-planning.read') ? [{ title: 'Work Planning', href: workPlanningIndex(), icon: CalendarClock }] : []),
        ...(can('work-data.read') ? [{ title: 'Work Data', href: workDataIndex(), icon: FileText }] : []),
        ...(can('daily-work.read') ? [{ title: 'Work Daily', href: workDailyIndex(), icon: CalendarCheck2 }] : []),
        ...(can('inventory.read') ? [{ title: 'Inventory', href: inventoriesIndex(), icon: Boxes }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
