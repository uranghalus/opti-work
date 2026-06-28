import { useForm } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { store } from '@/routes/tenants';

type CreateProps = {
    open: boolean;
    onClose: () => void;
};

export default function TenantCreateModal({ open, onClose }: CreateProps) {
    const createForm = useForm({
        name: '',
        company_name: '',
        status: 'active' as 'active' | 'inactive' | 'suspended',
        type: '',
        email: '',
        phone: '',
        area: '',
        location: '',
        logo: null as File | null,
        description: '',
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            createForm.setData('logo', file);
            const reader = new FileReader();
            reader.onload = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(store.url(), {
            onSuccess: () => {
                toast.success('Tenant berhasil ditambahkan.');
                createForm.reset();
                setLogoPreview(null);
                onClose();
            },
        });
    };

    const handleCancel = () => {
        createForm.reset();
        createForm.clearErrors();
        setLogoPreview(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 flex flex-col overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-4 border-b shrink-0">
                    <DialogTitle>Add New Tenant</DialogTitle>
                    <DialogDescription>
                        Fill in the details to register a new tenant, partner, or vendor.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {/* Logo Upload */}
                        <div className="grid gap-2">
                            <Label>Logo</Label>
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
                                    {createForm.errors.logo && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {createForm.errors.logo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Information */}
                        <div className="space-y-4">
                            <h3 className="border-b pb-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                Main Information
                            </h3>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-name">
                                        Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="create-name"
                                        name="name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Contact person name"
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-xs text-red-500">{createForm.errors.name}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-company_name">Company Name</Label>
                                    <Input
                                        id="create-company_name"
                                        name="company_name"
                                        value={createForm.data.company_name}
                                        onChange={(e) => createForm.setData('company_name', e.target.value)}
                                        placeholder="Company or business name"
                                    />
                                    {createForm.errors.company_name && (
                                        <p className="text-xs text-red-500">
                                            {createForm.errors.company_name}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-status">
                                        Status <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        name="status"
                                        value={createForm.data.status}
                                        onValueChange={(value: any) => createForm.setData('status', value)}
                                    >
                                        <SelectTrigger id="create-status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.status && (
                                        <p className="text-xs text-red-500">{createForm.errors.status}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-type">Type</Label>
                                    <Input
                                        id="create-type"
                                        name="type"
                                        value={createForm.data.type}
                                        onChange={(e) => createForm.setData('type', e.target.value)}
                                        placeholder="e.g. Internal, External, Vendor"
                                    />
                                    {createForm.errors.type && (
                                        <p className="text-xs text-red-500">{createForm.errors.type}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact & Location */}
                        <div className="space-y-4">
                            <h3 className="border-b pb-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                Contact & Location
                            </h3>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-email">Email</Label>
                                    <Input
                                        id="create-email"
                                        name="email"
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        placeholder="email@example.com"
                                    />
                                    {createForm.errors.email && (
                                        <p className="text-xs text-red-500">{createForm.errors.email}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-phone">Phone</Label>
                                    <Input
                                        id="create-phone"
                                        name="phone"
                                        value={createForm.data.phone}
                                        onChange={(e) => createForm.setData('phone', e.target.value)}
                                        placeholder="+62 812 3456 7890"
                                    />
                                    {createForm.errors.phone && (
                                        <p className="text-xs text-red-500">{createForm.errors.phone}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-area">Area</Label>
                                    <Input
                                        id="create-area"
                                        name="area"
                                        value={createForm.data.area}
                                        onChange={(e) => createForm.setData('area', e.target.value)}
                                        placeholder="Operational zone or region"
                                    />
                                    {createForm.errors.area && (
                                        <p className="text-xs text-red-500">{createForm.errors.area}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-location">Location</Label>
                                    <Input
                                        id="create-location"
                                        name="location"
                                        value={createForm.data.location}
                                        onChange={(e) => createForm.setData('location', e.target.value)}
                                        placeholder="Full address"
                                    />
                                    {createForm.errors.location && (
                                        <p className="text-xs text-red-500">
                                            {createForm.errors.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h3 className="border-b pb-2 text-sm font-semibold text-neutral-900 dark:text-white">
                                Description
                            </h3>
                            <div className="grid gap-2">
                                <textarea
                                    id="create-description"
                                    name="description"
                                    rows={4}
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-neutral-400 focus-visible:outline-hidden focus-visible:border-[#0071b7] focus-visible:ring-[3px] focus-visible:ring-[#0071b7]/20 dark:border-neutral-700 dark:placeholder:text-neutral-500 dark:focus-visible:border-[#0093dd]"
                                    placeholder="Additional notes about this tenant..."
                                />
                                {createForm.errors.description && (
                                    <p className="text-xs text-red-500">
                                        {createForm.errors.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button disabled={createForm.processing} type="submit">
                            {createForm.processing ? 'Saving...' : 'Save Tenant'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
