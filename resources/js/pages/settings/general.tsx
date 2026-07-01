import { Form, Head } from '@inertiajs/react';
import {
    Bell,
    Building2,
    CalendarDays,
    Eye,
    Globe,
    Languages,
    ListOrdered,
    Settings2,
    Shield,
} from 'lucide-react';
import AppSettingsController from '@/actions/App/Http/Controllers/Settings/AppSettingsController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { general as settingsGeneral } from '@/routes/settings';

type Props = {
    settings: Record<string, string | boolean | number>;
};

type Section = {
    title: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
    fields: {
        name: string;
        label: string;
        placeholder?: string;
        type: string;
        icon?: React.ElementType;
        options?: { value: string; label: string }[];
    }[];
};

const sections: Section[] = [
    {
        title: 'Application Info',
        description: 'Basic information about your application',
        icon: Building2,
        gradient: 'from-[#0071b7] to-[#0093dd]',
        fields: [
            { name: 'app_name', label: 'Application Name', placeholder: 'Optiwork', type: 'text', icon: Building2 },
            { name: 'app_description', label: 'Description', placeholder: 'Describe your application...', type: 'textarea', icon: Settings2 },
        ],
    },
    {
        title: 'Localization',
        description: 'Language, timezone and date preferences',
        icon: Globe,
        gradient: 'from-emerald-500 to-teal-400',
        fields: [
            { name: 'language', label: 'Language', type: 'select', icon: Languages, options: [
                { value: 'id', label: 'Bahasa Indonesia' },
                { value: 'en', label: 'English' },
            ]},
            { name: 'timezone', label: 'Timezone', type: 'select', icon: Globe, options: [
                { value: 'Asia/Jakarta', label: 'WIB (Asia/Jakarta)' },
                { value: 'Asia/Makassar', label: 'WITA (Asia/Makassar)' },
                { value: 'Asia/Jayapura', label: 'WIT (Asia/Jayapura)' },
                { value: 'UTC', label: 'UTC' },
            ]},
            { name: 'date_format', label: 'Date Format', type: 'select', icon: CalendarDays, options: [
                { value: 'd/m/Y', label: 'DD/MM/YYYY' },
                { value: 'm/d/Y', label: 'MM/DD/YYYY' },
                { value: 'Y-m-d', label: 'YYYY-MM-DD' },
                { value: 'd M Y', label: 'DD Mon YYYY' },
            ]},
        ],
    },
    {
        title: 'Display & Pagination',
        description: 'Control how data is displayed',
        icon: Eye,
        gradient: 'from-violet-500 to-purple-400',
        fields: [
            { name: 'items_per_page', label: 'Items Per Page', type: 'select', icon: ListOrdered, options: [
                { value: '10', label: '10' },
                { value: '25', label: '25' },
                { value: '50', label: '50' },
                { value: '100', label: '100' },
            ]},
        ],
    },
    {
        title: 'Notifications & Security',
        description: 'System notifications and security preferences',
        icon: Shield,
        gradient: 'from-amber-500 to-orange-400',
        fields: [],
    },
];

function FormField({ field, defaultValue, error }: {
    field: Section['fields'][0];
    defaultValue: string;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
            </Label>
            {field.type === 'select' && field.options ? (
                <Select name={field.name} defaultValue={defaultValue || field.options[0].value}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : field.type === 'textarea' ? (
                <Textarea
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    defaultValue={defaultValue}
                />
            ) : (
                <div className="relative">
                    {field.icon && (
                        <field.icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    )}
                    <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        defaultValue={defaultValue}
                        className={field.icon ? 'pl-9' : ''}
                    />
                </div>
            )}
            <InputError message={error} />
        </div>
    );
}

export default function General({ settings }: Props) {
    return (
        <>
            <Head title="General Settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="General Settings"
                    description="Manage your application configuration and preferences"
                />

                <Form
                    {...AppSettingsController.updateGeneral.form()}
                    options={{ preserveScroll: true }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0071b7] via-[#0088cc] to-[#0093dd] p-6 shadow-lg md:p-8">
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/30 blur-3xl" />
                                    <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-white/20 blur-3xl" />
                                </div>
                                <div className="relative flex items-center gap-4">
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                        <Settings2 className="size-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">System Configuration</h3>
                                        <p className="text-sm text-white/80">
                                            Customize how your application looks and behaves
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {sections.map((section) => (
                                    <Card key={section.title} className="overflow-hidden">
                                        <div className={cn(
                                            'bg-gradient-to-r px-6 py-4',
                                            section.gradient,
                                        )}>
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                                    <section.icon className="size-4 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-semibold text-white">
                                                        {section.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs text-white/70">
                                                        {section.description}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </div>
                                        <CardContent className="space-y-4 p-6">
                                            {section.fields.map((field) => (
                                                <FormField
                                                    key={field.name}
                                                    field={field}
                                                    defaultValue={String(settings[field.name] ?? '')}
                                                    error={errors[field.name]}
                                                />
                                            ))}

                                            {section.fields.length === 0 && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <Bell className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                            <div>
                                                                <Label className="text-sm font-medium">
                                                                    Enable Notifications
                                                                </Label>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Send system notifications to users
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <input type="hidden" name="enable_notifications" value="0" />
                                                        <Checkbox
                                                            name="enable_notifications"
                                                            defaultChecked={settings.enable_notifications === true || settings.enable_notifications === '1'}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <Shield className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                            <div>
                                                                <Label className="text-sm font-medium">
                                                                    Maintenance Mode
                                                                </Label>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Put the application in maintenance mode
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <input type="hidden" name="maintenance_mode" value="0" />
                                                        <Checkbox
                                                            name="maintenance_mode"
                                                            defaultChecked={settings.maintenance_mode === true || settings.maintenance_mode === '1'}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing} size="lg">
                                    {processing ? 'Saving...' : 'Save Settings'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

General.layout = {
    breadcrumbs: [
        {
            title: 'General Settings',
            href: settingsGeneral(),
        },
    ],
};
