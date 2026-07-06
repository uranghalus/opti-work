import { Form, Head } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';

type Props = { passwordRules: string };

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Security settings" />

            <div className="space-y-10">
                {/* Password section — Double-Bezel */}
                <div className="animate-fade-in rounded-2xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                    <div className="rounded-[calc(2rem-0.375rem)] bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] md:p-7">
                        <Heading
                            variant="small"
                            title="Update password"
                            description="Ensure your account is using a long, random password to stay secure"
                        />

                        <Form
                            {...SecurityController.update.form()}
                            options={{ preserveScroll: true }}
                            resetOnError={['password', 'password_confirmation', 'current_password']}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
passwordInput.current?.focus();
}

                                if (errors.current_password) {
currentPasswordInput.current?.focus();
}
                            }}
                            className="mt-6 space-y-5"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="current_password" className="text-sm font-medium">
                                            Current password
                                        </Label>
                                        <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                            <PasswordInput
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                name="current_password"
                                                className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                autoComplete="current-password"
                                                placeholder="Current password"
                                            />
                                        </div>
                                        <InputError message={errors.current_password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            New password
                                        </Label>
                                        <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                            <PasswordInput
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                autoComplete="new-password"
                                                placeholder="New password"
                                                passwordrules={props.passwordRules}
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation" className="text-sm font-medium">
                                            Confirm password
                                        </Label>
                                        <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
                                                autoComplete="new-password"
                                                placeholder="Confirm password"
                                                passwordrules={props.passwordRules}
                                            />
                                        </div>
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    <div className="flex items-center gap-4 pt-2">
                                        <Button
                                            disabled={processing}
                                            data-test="update-password-button"
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
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        { title: 'Security settings', href: edit() },
    ],
};
