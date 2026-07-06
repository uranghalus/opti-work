import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <div className="space-y-10">
                <div className="animate-fade-in rounded-2xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                    <div className="rounded-[calc(2rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                        <Heading
                            variant="small"
                            title="Appearance settings"
                            description="Update the appearance settings for your account"
                        />
                        <div className="mt-6">
                            <AppearanceTabs />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        { title: 'Appearance settings', href: editAppearance() },
    ],
};
