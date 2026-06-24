import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import TenantController from '@/actions/App/Http/Controllers/MasterData/TenantController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index } from '@/routes/tenants';

export default function TenantCreate() {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = () => {
                setLogoPreview(reader.result as string);
            };

            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <Head title="Add Tenant" />

            <div className="mx-auto w-full max-w-3xl space-y-6">
                {/* Back Link */}
                <Link
                    href={index.url()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-[#0071b7] dark:text-neutral-400 dark:hover:text-[#0093dd]"
                >
                    <ArrowLeft className="size-4" />
                    Back to Tenants
                </Link>

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Add New Tenant
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Fill in the details to register a new tenant, partner, or vendor.
                    </p>
                </div>

                {/* Form */}
                <Form
                    action={TenantController.store.url()}
                    method="post"
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Logo Upload */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
                                    Logo
                                </h2>
                                <div className="flex items-center gap-6">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-[#0071b7]/50 hover:bg-[#0071b7]/5 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-[#0093dd]/50 dark:hover:bg-[#0093dd]/5"
                                    >
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-neutral-400">
                                                <Upload className="size-5" />
                                                <span className="text-[10px]">Upload</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            name="logo"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Choose File
                                        </Button>
                                        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                            JPG, PNG, SVG or WebP. Max 2MB.
                                        </p>
                                        {errors.logo && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.logo}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Main Information */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
                                    Main Information
                                </h2>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="Contact person name"
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-red-500">{errors.name}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="company_name">Company Name</Label>
                                        <Input
                                            id="company_name"
                                            name="company_name"
                                            placeholder="Company or business name"
                                        />
                                        {errors.company_name && (
                                            <p className="text-xs text-red-500">
                                                {errors.company_name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">
                                            Status <span className="text-red-500">*</span>
                                        </Label>
                                        <Select name="status" defaultValue="active">
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-xs text-red-500">{errors.status}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Input
                                            id="type"
                                            name="type"
                                            placeholder="e.g. Internal, External, Vendor"
                                        />
                                        {errors.type && (
                                            <p className="text-xs text-red-500">{errors.type}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Location */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
                                    Contact & Location
                                </h2>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="email@example.com"
                                        />
                                        {errors.email && (
                                            <p className="text-xs text-red-500">{errors.email}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            placeholder="+62 812 3456 7890"
                                        />
                                        {errors.phone && (
                                            <p className="text-xs text-red-500">{errors.phone}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="area">Area</Label>
                                        <Input
                                            id="area"
                                            name="area"
                                            placeholder="Operational zone or region"
                                        />
                                        {errors.area && (
                                            <p className="text-xs text-red-500">{errors.area}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            placeholder="Full address"
                                        />
                                        {errors.location && (
                                            <p className="text-xs text-red-500">
                                                {errors.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <h2 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-white">
                                    Description
                                </h2>
                                <div className="grid gap-2">
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-neutral-400 focus-visible:border-[#0071b7] focus-visible:ring-[3px] focus-visible:ring-[#0071b7]/20 focus-visible:outline-none dark:border-neutral-700 dark:placeholder:text-neutral-500 dark:focus-visible:border-[#0093dd]"
                                        placeholder="Additional notes about this tenant..."
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-red-500">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3">
                                <Link href={index.url()}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button disabled={processing} type="submit">
                                    {processing ? 'Saving...' : 'Save Tenant'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

TenantCreate.layout = {
    breadcrumbs: [
        {
            title: 'Tenants',
            href: index(),
        },
        {
            title: 'Add Tenant',
            href: '/tenants/create',
        },
    ],
};
