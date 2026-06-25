import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    Briefcase,
    Building2,
    CalendarDays,
    ChevronDown,
    ClipboardList,
    FileText,
    LayoutGrid,
    Menu,
    Monitor,
    Moon,
    Package,
    Settings,
    Sun,
    Users,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import tenants from '@/routes/tenants';
import workOrders from '@/routes/work-orders';
import type { BreadcrumbItem, NavDropdownItem, NavItem } from '@/types';


type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const workNavItems: NavDropdownItem[] = [
    {
        title: 'Work Management',
        icon: Briefcase,
        children: [
            { title: 'Work Orders', href: workOrders.index(), icon: ClipboardList },
            { title: 'Daily Work', href: dashboard(), icon: CalendarDays },
            { title: 'Work Planning', href: dashboard(), icon: FileText },
            { title: 'Schedule', href: dashboard(), icon: CalendarDays },
        ],
    },
    {
        title: 'Assets & Tools',
        icon: Wrench,
        children: [
            { title: 'Equipment', href: dashboard(), icon: Wrench },
            { title: 'Spare Parts', href: dashboard(), icon: Package },
            { title: 'Maintenance Log', href: dashboard(), icon: FileText },
        ],
    },
    {
        title: 'Reports',
        icon: BarChart3,
        children: [
            { title: 'Work Reports', href: dashboard(), icon: FileText },
            { title: 'Performance', href: dashboard(), icon: BarChart3 },
            { title: 'Summary', href: dashboard(), icon: ClipboardList },
        ],
    },
    {
        title: 'Organization',
        icon: Building2,
        children: [
            { title: 'Employees', href: dashboard(), icon: Users },
            { title: 'Departments', href: dashboard(), icon: Building2 },
            { title: 'Divisions', href: dashboard(), icon: Building2 },
            { title: 'Tenants', href: tenants.index(), icon: Building2 },
        ],
    },
    {
        title: 'Settings',
        icon: Settings,
        href: dashboard(),
    },
];

function AppearanceToggle() {
    const { appearance, updateAppearance } = useAppearance();

    const nextMode = () => {
        if (appearance === 'light') { updateAppearance('dark'); }
        else if (appearance === 'dark') { updateAppearance('system'); }
        else { updateAppearance('light'); }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={nextMode}
            className="h-9 w-9 cursor-pointer text-neutral-600 hover:text-[#0071b7] dark:text-neutral-400 dark:hover:text-[#0093dd]"
            title={`Theme: ${appearance}`}
        >
            {appearance === 'light' && <Sun className="size-5" />}
            {appearance === 'dark' && <Moon className="size-5" />}
            {appearance === 'system' && <Monitor className="size-5" />}
        </Button>
    );
}

function NavDropdown({ item }: { item: NavDropdownItem }) {
    const { isCurrentUrl } = useCurrentUrl();

    if (!item.children) {
        return (
            <Link
                href={item.href ?? dashboard()}
                className={cn(
                    'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#0071b7]/10 hover:text-[#0071b7] dark:hover:bg-[#0093dd]/10 dark:hover:text-[#0093dd]',
                    item.href && isCurrentUrl(item.href)
                        ? 'bg-[#0071b7]/10 text-[#0071b7] dark:bg-[#0093dd]/10 dark:text-[#0093dd]'
                        : 'text-neutral-700 dark:text-neutral-300',
                )}
            >
                {item.icon && <item.icon className="size-4" />}
                {item.title}
            </Link>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#0071b7]/10 hover:text-[#0071b7] dark:hover:bg-[#0093dd]/10 dark:hover:text-[#0093dd]',
                        'text-neutral-700 dark:text-neutral-300',
                    )}
                >
                    {item.icon && <item.icon className="size-4" />}
                    {item.title}
                    <ChevronDown className="size-3.5 opacity-60" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuGroup>
                    {item.children.map((child) => (
                        <DropdownMenuItem key={child.title} asChild>
                            <Link
                                href={child.href}
                                className="flex cursor-pointer items-center gap-2"
                            >
                                {child.icon && <child.icon className="size-4 text-[#0071b7] dark:text-[#0093dd]" />}
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
    return (
        <div className="flex flex-col gap-1 py-2">
            {mainNavItems.map((item) => (
                <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-[#0071b7]/10 hover:text-[#0071b7] dark:text-neutral-300 dark:hover:bg-[#0093dd]/10 dark:hover:text-[#0093dd]"
                >
                    {item.icon && <item.icon className="size-4" />}
                    {item.title}
                </Link>
            ))}
            <div className="my-2 h-px bg-neutral-200 dark:bg-neutral-700" />
            {workNavItems.map((item) => (
                <div key={item.title}>
                    {item.children ? (
                        <MobileNavGroup item={item} />
                    ) : (
                        <Link
                            href={item.href ?? dashboard()}
                            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-[#0071b7]/10 hover:text-[#0071b7] dark:text-neutral-300 dark:hover:bg-[#0093dd]/10 dark:hover:text-[#0093dd]"
                        >
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
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-[#0071b7]/10 hover:text-[#0071b7] dark:text-neutral-300 dark:hover:bg-[#0093dd]/10 dark:hover:text-[#0093dd]"
            >
                <span className="flex items-center gap-3">
                    {item.icon && <item.icon className="size-4" />}
                    {item.title}
                </span>
                <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
            </button>
            {open && item.children && (
                <div className="ml-4 flex flex-col gap-0.5 border-l border-neutral-200 pl-3 dark:border-neutral-700">
                    {item.children.map((child) => (
                        <Link
                            key={child.title}
                            href={child.href}
                            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-[#0071b7]/10 hover:text-[#0071b7] dark:text-neutral-400 dark:hover:bg-[#0093dd]/10 dark:hover:text-[#0093dd]"
                        >
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
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <>
            {/* Main Navbar */}
            <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/80 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/80">
                <div className="mx-auto flex h-16 items-center gap-4 px-4 md:px-6 lg:max-w-[1400px]">
                    {/* Mobile Menu Trigger */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 bg-white p-4 dark:bg-neutral-950">
                                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                                <SheetHeader className="mb-4 flex items-center gap-2 px-3">
                                    <AppLogoIcon className="size-7 fill-[#0071b7]" />
                                    <span className="text-lg font-bold text-neutral-900 dark:text-white">Optiwork</span>
                                </SheetHeader>
                                <MobileNavContent />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo */}
                    <Link href={dashboard()} prefetch className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#0071b7] to-[#0093dd] shadow-sm">
                            <AppLogoIcon className="size-5 fill-white" />
                        </div>
                        <span className="hidden text-lg font-bold tracking-tight text-neutral-900 sm:block dark:text-white">
                            Optiwork
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="ml-4 hidden items-center gap-0.5 lg:flex">
                        {mainNavItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#0071b7]/10 hover:text-[#0071b7] dark:hover:bg-[#0093dd]/10 dark:hover:text-[#0093dd]',
                                    isCurrentUrl(item.href)
                                        ? 'bg-[#0071b7]/10 text-[#0071b7] dark:bg-[#0093dd]/10 dark:text-[#0093dd]'
                                        : 'text-neutral-700 dark:text-neutral-300',
                                )}
                            >
                                {item.icon && <item.icon className="size-4" />}
                                {item.title}
                            </Link>
                        ))}
                        <div className="mx-2 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
                        {workNavItems.map((item) => (
                            <NavDropdown key={item.title} item={item} />
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="ml-auto flex items-center gap-1">
                        {/* Appearance Toggle */}
                        <AppearanceToggle />

                        {/* Notifications */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 cursor-pointer text-neutral-600 hover:text-[#0071b7] dark:text-neutral-400 dark:hover:text-[#0093dd]"
                        >
                            <Bell className="size-5" />
                            <Badge className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-[#0071b7] p-0 text-[10px] font-bold text-white dark:bg-[#0093dd]">
                                3
                            </Badge>
                        </Button>

                        {/* User Avatar Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="ml-1 flex h-9 items-center gap-2 rounded-full px-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                >
                                    <Avatar className="size-7 ring-2 ring-[#0071b7]/20 dark:ring-[#0093dd]/20">
                                        <AvatarImage
                                            src={auth.user?.avatar}
                                            alt={auth.user?.name}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-[#0071b7] to-[#0093dd] text-xs font-semibold text-white">
                                            {getInitials(auth.user?.name ?? '')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="hidden size-3.5 text-neutral-500 sm:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                {auth.user && <UserMenuContent user={auth.user} />}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
                <div className="border-b border-neutral-200/60 bg-neutral-50/50 dark:border-neutral-800/60 dark:bg-neutral-900/50">
                    <div className="mx-auto flex h-10 items-center px-4 md:px-6 lg:max-w-[1400px]">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
