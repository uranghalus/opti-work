import { Link, usePage } from '@inertiajs/react';
import { BarChart3, Briefcase, Building2, CalendarDays, ChevronDown, ClipboardList, FileText, LayoutGrid, Menu, Monitor, Moon, Package, Settings, Sun, Users, Wrench } from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationBell } from '@/components/notification-bell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import departments from '@/routes/departments';
import divisions from '@/routes/divisions';
import employees from '@/routes/employees';
import { edit as editProfile } from '@/routes/profile';
import tenants from '@/routes/tenants';
import workOrders from '@/routes/work-orders';
import type { BreadcrumbItem, NavDropdownItem, NavItem } from '@/types';

type Props = { breadcrumbs?: BreadcrumbItem[] };

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
];

const workNavItems: NavDropdownItem[] = [
    {
        title: 'Work Management', icon: Briefcase,
        children: [
            { title: 'Work Orders', href: workOrders.index(), icon: ClipboardList },
            { title: 'Daily Work', href: dashboard(), icon: CalendarDays },
            { title: 'Work Planning', href: dashboard(), icon: FileText },
            { title: 'Schedule', href: dashboard(), icon: CalendarDays },
        ],
    },
    {
        title: 'Assets & Tools', icon: Wrench,
        children: [
            { title: 'Equipment', href: dashboard(), icon: Wrench },
            { title: 'Spare Parts', href: dashboard(), icon: Package },
            { title: 'Maintenance Log', href: dashboard(), icon: FileText },
        ],
    },
    {
        title: 'Reports', icon: BarChart3,
        children: [
            { title: 'Work Reports', href: dashboard(), icon: FileText },
            { title: 'Performance', href: dashboard(), icon: BarChart3 },
            { title: 'Summary', href: dashboard(), icon: ClipboardList },
        ],
    },
    {
        title: 'Organization', icon: Building2,
        children: [
            { title: 'Employees', href: employees.index(), icon: Users },
            { title: 'Departments', href: departments.index(), icon: Building2 },
            { title: 'Divisions', href: divisions.index(), icon: Building2 },
            { title: 'Tenants', href: tenants.index(), icon: Building2 },
        ],
    },
    { title: 'Settings', icon: Settings, href: editProfile() },
];

const btn = 'transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]';

function AppThemeToggle() {
    const { appearance, updateAppearance } = useAppearance();
    const next = () => {
 if (appearance === 'light') {
updateAppearance('dark');
} else if (appearance === 'dark') {
updateAppearance('system');
} else {
updateAppearance('light');
} 
};

    return (
        <Button variant="ghost" size="icon" onClick={next} className={`h-9 w-9 cursor-pointer text-muted-foreground hover:text-primary ${btn}`} title={`Theme: ${appearance}`}>
            {appearance === 'light' && <Sun className="size-5" />}
            {appearance === 'dark' && <Moon className="size-5" />}
            {appearance === 'system' && <Monitor className="size-5" />}
        </Button>
    );
}

function NavDropdown({ item }: { item: NavDropdownItem }) {
    const { isCurrentUrl } = useCurrentUrl();
    const navClass = 'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20';

    if (!item.children) {
        const isActive = item.title === 'Settings'
            ? isCurrentUrl('/settings', undefined, true)
            : isCurrentUrl(item.href!);

        return (
            <Link href={item.href ?? dashboard()} className={cn(navClass, isActive && 'bg-primary/10 text-primary')}>
                {item.icon && <item.icon className="size-4" />}
                {item.title}
            </Link>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(navClass, 'cursor-pointer')}>
                    {item.icon && <item.icon className="size-4" />}
                    {item.title}
                    <ChevronDown className={`size-3.5 opacity-60 ${btn}`} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 rounded-xl border-border/50 p-1.5 shadow-lg">
                <DropdownMenuGroup>
                    {item.children.map((child) => (
                        <DropdownMenuItem key={child.title} asChild>
                            <Link href={child.href} className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-foreground ${btn}`}>
                                {child.icon && <child.icon className="size-4 text-primary" />}
                                {child.title}
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function MobileNavContent() {
    const navClass = 'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20';

    return (
        <div className="flex flex-col gap-1 py-2">
            {mainNavItems.map((item) => (
                <Link key={item.title} href={item.href} className={navClass}>
                    {item.icon && <item.icon className="size-4" />}
                    {item.title}
                </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            {workNavItems.map((item) => (
                <div key={item.title}>
                    {item.children ? <MobileNavGroup item={item} /> : (
                        <Link href={item.href ?? dashboard()} className={navClass}>
                            {item.icon && <item.icon className="size-4" />}
                            {item.title}
                        </Link>
                    )}
                </div>
            ))}
        </div>
    );
}

function MobileNavGroup({ item }: { item: NavDropdownItem }) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20">
                <span className="flex items-center gap-3">
                    {item.icon && <item.icon className="size-4" />}
                    {item.title}
                </span>
                <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
            </button>
            {open && item.children && (
                <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-3">
                    {item.children.map((child) => (
                        <Link key={child.title} href={child.href} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20">
                            {child.icon && <child.icon className="size-3.5" />}
                            {child.title}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export function AppHeader({ breadcrumbs = [] }: Props) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-2xl">
                <div className="mx-auto flex h-16 items-center gap-4 px-4 md:px-6 lg:max-w-[1400px]">
                    {/* Mobile trigger */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9"><Menu className="size-5" /></Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 border-r-border/50 bg-background/95 p-4 backdrop-blur-2xl">
                                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                                <SheetHeader className="mb-4 flex items-center gap-2 px-3">
                                    <AppLogoIcon className="size-7 fill-primary" />
                                    <span className="text-lg font-bold text-foreground">Optiwork</span>
                                </SheetHeader>
                                <MobileNavContent />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo */}
                    <Link href={dashboard()} prefetch className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#0093dd] shadow-sm">
                            <AppLogoIcon className="size-5 fill-primary-foreground" />
                        </div>
                        <span className="hidden text-lg font-bold tracking-tight text-foreground sm:block">Optiwork</span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="ml-4 hidden items-center gap-0.5 lg:flex">
                        {mainNavItems.map((item) => (
                            <Link key={item.title} href={item.href}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20',
                                    isCurrentUrl(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground',
                                )}>
                                {item.icon && <item.icon className="size-4" />}
                                {item.title}
                            </Link>
                        ))}
                        <div className="mx-2 h-5 w-px bg-border" />
                        {workNavItems.map((item) => (
                            <NavDropdown key={item.title} item={item} />
                        ))}
                    </nav>

                    {/* Right */}
                    <div className="ml-auto flex items-center gap-1">
                        <AppThemeToggle />

                        <NotificationBell />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className={`ml-1 flex h-9 items-center gap-2 rounded-full px-1.5 hover:bg-accent ${btn}`}>
                                    <Avatar className="size-7 ring-2 ring-primary/20">
                                        <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-[#0093dd] text-xs font-semibold text-primary-foreground">{getInitials(auth.user?.name ?? '')}</AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="hidden size-3.5 text-muted-foreground/60 sm:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 rounded-xl border-border/50 p-1.5 shadow-lg" align="end">
                                {auth.user && <UserMenuContent user={auth.user} />}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
                <div className="border-b border-border/30 bg-accent/20">
                    <div className="mx-auto flex h-10 items-center px-4 md:px-6 lg:max-w-[1400px]">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
