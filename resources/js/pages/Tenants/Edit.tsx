import { useForm } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import { update } from '@/routes/tenants';

type Tenant = {
    id: number;
    name: string;
    company_name: string | null;
    status: 'active' | 'inactive' | 'suspended';
    type: string | null;
    email: string | null;
    phone: string | null;
    area: string | null;
    location: string | null;
    logo_url: string | null;
    description: string | null;
};

type EditProps = {
    open: boolean;
    onClose: () => void;
    tenant: Tenant | null;
};

export default function TenantEditModal({ open, onClose, tenant }: EditProps) {
    const editForm = useForm({
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

    const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    // Sync form with tenant prop when it changes or modal opens
    useEffect(() => {
        if (tenant) {
            editForm.setData({
                name: tenant.name,
                company_name: tenant.company_name ?? '',
                status: tenant.status,
                type: tenant.type ?? '',
                email: tenant.email ?? '',
                phone: tenant.phone ?? '',
                area: tenant.area ?? '',
                location: tenant.location ?? '',
                logo: null,
                description: tenant.description ?? '',
            });
            setEditLogoPreview(tenant.logo_url);
        }
    }, [tenant, open]);

    const handleEditLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            editForm.setData('logo', file);
            const reader = new FileReader();
            reader.onload = () => {
                setEditLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant) {
            return;
        }

        editForm.post(update.url({ tenant: tenant.id }, {
            query: { _method: 'PUT' }
        }), {
            onSuccess: () => {
                toast.success('Data Tenant berhasil diperbarui.');
                editForm.reset();
                setEditLogoPreview(null);
                onClose();
            },
        });
    };

    const handleCancel = () => {
        editForm.reset();
        editForm.clearErrors();
        setEditLogoPreview(null);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 flex flex-col overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-4 border-b shrink-0">
                    <DialogTitle>Edit Tenant</DialogTitle>
                    <DialogDescription>
                        Update the details for the selected tenant.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {/* Logo Upload */}
                        <div className="grid gap-2">
                            <Label>Logo</Label>
                            <div className="flex items-center gap-6">
                                <div
                                    onClick={() => editFileInputRef.current?.click()}
                                    className="flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 transition-colors hover:border-[#0071b7]/50 hover:bg-[#0071b7]/5 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-[#0093dd]/50 dark:hover:bg-[#0093dd]/5"
                                >
                                    {editLogoPreview ? (
                                        <img
                                            src={editLogoPreview}
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
                                        ref={editFileInputRef}
                                        type="file"
                                        name="logo"
                                        accept="image/*"
                                        onChange={handleEditLogoChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => editFileInputRef.current?.click()}
                                    >
                                        Change Logo
                                    </Button>
                                    <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                        JPG, PNG, SVG or WebP. Max 2MB.
                                    </p>
                                    {editForm.errors.logo && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {editForm.errors.logo}
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
                                    <Label htmlFor="edit-name">
                                        Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="edit-name"
                                        name="name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        placeholder="Contact person name"
                                    />
                                    {editForm.errors.name && (
                                        <p className="text-xs text-red-500">{editForm.errors.name}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-company_name">Company Name</Label>
                                    <Input
                                        id="edit-company_name"
                                        name="company_name"
                                        value={editForm.data.company_name}
                                        onChange={(e) => editForm.setData('company_name', e.target.value)}
                                        placeholder="Company or business name"
                                    />
                                    {editForm.errors.company_name && (
                                        <p className="text-xs text-red-500">
                                            {editForm.errors.company_name}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-status">
                                        Status <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        name="status"
                                        value={editForm.data.status}
                                        onValueChange={(value: any) => editForm.setData('status', value)}
                                    >
                                        <SelectTrigger id="edit-status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {editForm.errors.status && (
                                        <p className="text-xs text-red-500">{editForm.errors.status}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-type">Type</Label>
                                    <Input
                                        id="edit-type"
                                        name="type"
                                        value={editForm.data.type}
                                        onChange={(e) => editForm.setData('type', e.target.value)}
                                        placeholder="e.g. Internal, External, Vendor"
                                    />
                                    {editForm.errors.type && (
                                        <p className="text-xs text-red-500">{editForm.errors.type}</p>
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
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        name="email"
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        placeholder="email@example.com"
                                    />
                                    {editForm.errors.email && (
                                        <p className="text-xs text-red-500">{editForm.errors.email}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-phone">Phone</Label>
                                    <Input
                                        id="edit-phone"
                                        name="phone"
                                        value={editForm.data.phone}
                                        onChange={(e) => editForm.setData('phone', e.target.value)}
                                        placeholder="+62 812 3456 7890"
                                    />
                                    {editForm.errors.phone && (
                                        <p className="text-xs text-red-500">{editForm.errors.phone}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-area">Area</Label>
                                    <Input
                                        id="edit-area"
                                        name="area"
                                        value={editForm.data.area}
                                        onChange={(e) => editForm.setData('area', e.target.value)}
                                        placeholder="Operational zone or region"
                                    />
                                    {editForm.errors.area && (
                                        <p className="text-xs text-red-500">{editForm.errors.area}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-location">Location</Label>
                                    <Input
                                        id="edit-location"
                                        name="location"
                                        value={editForm.data.location}
                                        onChange={(e) => editForm.setData('location', e.target.value)}
                                        placeholder="Full address"
                                    />
                                    {editForm.errors.location && (
                                        <p className="text-xs text-red-500">
                                            {editForm.errors.location}
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
                                    id="edit-description"
                                    name="description"
                                    rows={4}
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                    className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-neutral-400 focus-visible:outline-hidden focus-visible:border-[#0071b7] focus-visible:ring-[3px] focus-visible:ring-[#0071b7]/20 dark:border-neutral-700 dark:placeholder:text-neutral-500 dark:focus-visible:border-[#0093dd]"
                                    placeholder="Additional notes about this tenant..."
                                />
                                {editForm.errors.description && (
                                    <p className="text-xs text-red-500">
                                        {editForm.errors.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-4 border-t bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button disabled={editForm.processing} type="submit">
                            {editForm.processing ? 'Saving...' : 'Update Tenant'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
