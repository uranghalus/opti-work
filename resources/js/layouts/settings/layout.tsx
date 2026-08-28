import { Link } from '@inertiajs/react';
import { Monitor, Shield, User, Link2, Users } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { edit as editWaha } from '@/routes/waha';
import { index as editRoles } from '@/routes/roles';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile', href: edit(), icon: User },
    { title: 'Security', href: editSecurity(), icon: Shield },
    { title: 'Appearance', href: editAppearance(), icon: Monitor },
    { title: 'WAHA Connection', href: editWaha(), icon: Link2 },
    { title: 'Roles & Permissions', href: editRoles(), icon: Users },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10">
            {/* Eyebrow + Heading */}
            <div className="animate-fade-in space-y-3">
                <span className="inline-block rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-[11px] font-semibold tracking-[0.15em] text-primary uppercase">
                    Account
                </span>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Settings
                    </h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        Manage your profile, security, and appearance preferences
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
                {/* Sidebar — Double-Bezel outer shell */}
                <aside className="w-full shrink-0 lg:w-56">
                    <div className="rounded-2xl border border-border/50 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                        <nav
                            aria-label="Settings"
                            className="flex flex-row gap-1 overflow-x-auto rounded-[calc(1rem-4px)] bg-background p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] lg:flex-col"
                        >
                            {sidebarNavItems.map((item) => {
                                const active = isCurrentOrParentUrl(item.href);

                                return (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className={cn(
                                            'group flex items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                                            active
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon
                                                className={cn(
                                                    'size-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]',
                                                    !active && 'group-hover:scale-110',
                                                )}
                                            />
                                        )}
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Content — Double-Bezel outer shell */}
                <div className="min-w-0 flex-1">
                    <div className="rounded-2xl border border-border/50 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                        <div className="rounded-[calc(2rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] md:p-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
