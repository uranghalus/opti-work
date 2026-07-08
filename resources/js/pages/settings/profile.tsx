import { Form, Head, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';

type PageProps = { auth: Auth };

export default function Profile() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Profile settings" />

            <div className="space-y-10">
                {/* Profile section — Double-Bezel */}
                <div className="animate-fade-in rounded-2xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                    <div className="rounded-[calc(2rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                        <Heading
                            variant="small"
                            title="Profile"
                            description="Update your name and email address"
                        />

                        <Form
                            {...ProfileController.update.form()}
                            options={{ preserveScroll: true }}
                            className="mt-6 space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Name
                                        </Label>
                                        <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                            <Input
                                                id="name"
                                                className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                defaultValue={auth.user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder="Full name"
                                            />
                                        </div>
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email address
                                        </Label>
                                        <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                            <Input
                                                id="email"
                                                type="email"
                                                className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder="Email address"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <Button
                                            disabled={processing}
                                            data-test="update-profile-button"
                                            className="group rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                                        >
                                            Save
                                            <span className="ml-2.5 flex size-6 items-center justify-center rounded-full bg-white/15 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
                                                <ArrowRight className="size-3.5" />
                                            </span>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                {/* Delete section */}
                <div className="animate-fade-in animate-delay-200">
                    <DeleteUser />
                </div>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        { title: 'Profile settings', href: edit() },
    ],
};
