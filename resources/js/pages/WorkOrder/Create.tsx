import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ClipboardList,
    DollarSign,
    FileText,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    MapPin,
    Building2,
    Camera,
    X,
    Image,
} from 'lucide-react';
import { useState } from 'react';

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
import { TenantSearchableSelect } from '@/components/workflow/TenantSearchableSelect';
import { index as workOrdersIndex } from '@/routes/work-orders';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Department = {
    id: number;
    name: string;
    code?: string;
};

type Tenant = {
    id: number;
    name: string;
};

type PageProps = {
    departments: Department[];
    tenants: Tenant[];
};

export default function WorkOrderCreate({ departments, tenants }: PageProps) {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [locationType, setLocationType] = useState('location');
    const [selectedTenant, setSelectedTenant] = useState('');
    const [priorityType, setPriorityType] = useState('normal');
    const [urgentSubType, setUrgentSubType] = useState('');
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedPhotos(files);

        // Generate previews
        const previews: string[] = [];
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result as string);

                if (previews.length === files.length) {
                    setPhotoPreviews(previews);
                }
            };
            reader.readAsDataURL(file);
        });

        if (files.length === 0) {
            setPhotoPreviews([]);
        }
    };

    const removePhoto = (index: number) => {
        const newPhotos = selectedPhotos.filter((_, i) => i !== index);
        const newPreviews = photoPreviews.filter((_, i) => i !== index);
        setSelectedPhotos(newPhotos);
        setPhotoPreviews(newPreviews);
    };

    return (
        <>
            <Head title="Create Work Order" />

            <div className="mx-auto w-full max-w-3xl space-y-6">
                {/* Back Link */}
                <Link
                    href={workOrdersIndex.url()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-[#0071b7] dark:text-neutral-400 dark:hover:text-[#0093dd]"
                >
                    <ArrowLeft className="size-4" />
                    Back to Work Orders
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Create Work Order
                        </h1>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            Fill in the details to create a new work order request
                        </p>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-[#0071b7] to-[#0093dd] shadow-md ring-4 ring-[#0071b7]/10">
                        <ClipboardList className="size-6 text-white" />
                    </div>
                </div>

                {/* Form */}
                <Form
                    action="/work-orders"
                    method="post"
                    encType="multipart/form-data"
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Work Order Details */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <FileText className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Work Order Details
                                    </h2>
                                </div>
                                <div className="space-y-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="rincian_pekerjaan">
                                            Work Description{' '}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="rincian_pekerjaan"
                                            name="rincian_pekerjaan"
                                            placeholder="Brief description of the work to be done"
                                            className="text-base"
                                        />
                                        {errors.rincian_pekerjaan && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.rincian_pekerjaan}
                                            </p>
                                        )}
                                    </div>

                                    {/* Location Type Selection */}
                                    <div className="grid gap-3">
                                        <Label>Location Type</Label>
                                        <RadioGroup
                                            value={locationType}
                                            onValueChange={setLocationType}
                                            className="flex gap-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="location" id="location" />
                                                <Label htmlFor="location" className="cursor-pointer">
                                                    <MapPin className="mr-1 inline size-4" />
                                                    Location
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="tenant" id="tenant" />
                                                <Label htmlFor="tenant" className="cursor-pointer">
                                                    <Building2 className="mr-1 inline size-4" />
                                                    Tenant
                                                </Label>
                                            </div>
                                        </RadioGroup>

                                        {locationType === 'location' ? (
                                            <Input
                                                id="lokasi"
                                                name="lokasi"
                                                placeholder="Work location or site"
                                            />
                                        ) : (
                                            <TenantSearchableSelect
                                                tenants={tenants}
                                                value={selectedTenant}
                                                onChange={(value) => {
                                                    setSelectedTenant(value);
                                                }}
                                                placeholder="Search and select tenant..."
                                                error={errors.tenant_id as string}
                                            />
                                        )}
                                        {errors.lokasi && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.lokasi}
                                            </p>
                                        )}
                                        <input
                                            type="hidden"
                                            name="location_type"
                                            value={locationType}
                                        />
                                        <input
                                            type="hidden"
                                            name="tenant_id"
                                            value={locationType === 'tenant' ? selectedTenant : ''}
                                        />
                                        <input
                                            type="hidden"
                                            name="tenant_name"
                                            value={
                                                locationType === 'tenant'
                                                    ? tenants.find((t) => t.id.toString() === selectedTenant)?.name || ''
                                                    : ''
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Priority & Classification */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <AlertTriangle className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Priority & Classification
                                    </h2>
                                </div>
                                <div className="space-y-5">
                                    {/* Priority Type */}
                                    <div className="grid gap-2">
                                        <Label>
                                            Priority Type{' '}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <RadioGroup
                                            value={priorityType}
                                            onValueChange={(value: string) => {
                                                setPriorityType(value);

                                                if (value === 'normal') {
                                                    setUrgentSubType('');
                                                }
                                            }}
                                            className="flex gap-4"
                                        >
                                            <div className="flex-1">
                                                <div
                                                    className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${priorityType === 'normal'
                                                        ? 'border-[#0071b7] bg-[#0071b7]/5 dark:border-[#0093dd] dark:bg-[#0093dd]/5'
                                                        : 'border-neutral-200 dark:border-neutral-700'
                                                        }`}
                                                    onClick={() => setPriorityType('normal')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-3 rounded-full bg-emerald-500" />
                                                        <span className="font-medium">Normal</span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                        Standard processing
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div
                                                    className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${priorityType === 'urgent'
                                                        ? 'border-red-500 bg-red-500/5 dark:border-red-400 dark:bg-red-400/5'
                                                        : 'border-neutral-200 dark:border-neutral-700'
                                                        }`}
                                                    onClick={() => setPriorityType('urgent')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-3 rounded-full bg-red-500" />
                                                        <span className="font-medium text-red-600 dark:text-red-400">
                                                            Urgent
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                        Requires immediate attention
                                                    </p>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                        <input
                                            type="hidden"
                                            name="priority_type"
                                            value={priorityType}
                                        />
                                        {errors.priority_type && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.priority_type}
                                            </p>
                                        )}
                                    </div>

                                    {/* Urgent Sub-Type */}
                                    {priorityType === 'urgent' && (
                                        <div className="grid gap-2">
                                            <Label>
                                                Urgent Type{' '}
                                                <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={urgentSubType}
                                                onValueChange={(value) => {
                                                    setUrgentSubType(value);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select urgent type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="by_accident">
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle className="size-4 text-red-500" />
                                                            <span>Urgent By Accident</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="by_owner">
                                                        <div className="flex items-center gap-2">
                                                            <AlertCircle className="size-4 text-amber-500" />
                                                            <span>Urgent Request By Owner</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <input
                                                type="hidden"
                                                name="urgent_sub_type"
                                                value={urgentSubType}
                                            />
                                            {urgentSubType === 'by_accident' && (
                                                <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 dark:bg-amber-500/10">
                                                    <AlertTriangle className="mt-0.5 size-4 text-amber-600 dark:text-amber-400" />
                                                    <p className="text-xs text-amber-800 dark:text-amber-300">
                                                        <strong>Note:</strong> HOD must execute this work immediately. Scheduling is not allowed.
                                                    </p>
                                                </div>
                                            )}
                                            {errors.urgent_sub_type && (
                                                <p className="flex items-center gap-1 text-xs text-red-500">
                                                    <AlertCircle className="size-3" />
                                                    {errors.urgent_sub_type}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Legacy Prioritas Field (keeping for compatibility) */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="prioritas">
                                            Priority Level
                                        </Label>
                                        <Select name="prioritas" defaultValue="medium">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select priority level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full bg-emerald-500" />
                                                        Low
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="medium">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full bg-amber-500" />
                                                        Medium
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="high">
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full bg-red-500" />
                                                        High
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.prioritas && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.prioritas}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Department & Personnel */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <Building2 className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Department & Personnel
                                    </h2>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Select
                                            value={selectedDepartment}
                                            onValueChange={setSelectedDepartment}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">
                                                    Select department
                                                </SelectItem>
                                                {departments.map((dept) => (
                                                    <SelectItem
                                                        key={dept.id}
                                                        value={dept.name}
                                                    >
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input
                                            type="hidden"
                                            name="department"
                                            value={selectedDepartment}
                                        />
                                        {errors.department && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.department}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="pic">
                                            Person In Charge (PIC)
                                        </Label>
                                        <Input
                                            id="pic"
                                            name="pic"
                                            placeholder="Name of responsible person"
                                        />
                                        {errors.pic && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.pic}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Budget */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <DollarSign className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Budget
                                    </h2>
                                </div>
                                <div className="grid gap-2">
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                                        <Input
                                            id="budget"
                                            name="budget"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.budget && (
                                        <p className="flex items-center gap-1 text-xs text-red-500">
                                            <AlertCircle className="size-3" />
                                            {errors.budget}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <FileText className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Additional Notes
                                    </h2>
                                </div>
                                <div className="grid gap-2">
                                    <textarea
                                        id="keterangan"
                                        name="keterangan"
                                        rows={4}
                                        className="flex w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-neutral-400 focus-visible:border-[#0071b7] focus-visible:ring-[3px] focus-visible:ring-[#0071b7]/20 focus-visible:outline-none dark:border-neutral-700 dark:placeholder:text-neutral-500 dark:focus-visible:border-[#0093dd]"
                                        placeholder="Any additional information, notes, or remarks about this work order..."
                                    />
                                    {errors.keterangan && (
                                        <p className="flex items-center gap-1 text-xs text-red-500">
                                            <AlertCircle className="size-3" />
                                            {errors.keterangan}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Incident Photos */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <Camera className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Incident Photos
                                    </h2>
                                </div>
                                <div className="grid gap-4">
                                    <div>
                                        <Label htmlFor="incident_photos">
                                            Upload Photos <span className="text-xs text-neutral-400">(Optional, max 5MB each)</span>
                                        </Label>
                                        <div className="mt-2">
                                            <label
                                                htmlFor="incident_photos"
                                                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-8 transition-colors hover:border-[#0071b7] hover:bg-[#0071b7]/5 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-[#0093dd] dark:hover:bg-[#0093dd]/5"
                                            >
                                                <Image className="mb-3 size-10 text-neutral-400" />
                                                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                    PNG, JPG, JPEG, GIF (max 5MB each)
                                                </p>
                                                <input
                                                    id="incident_photos"
                                                    name="incident_photos[]"
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handlePhotoChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        {errors.incident_photos && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.incident_photos}
                                            </p>
                                        )}
                                    </div>

                                    {/* Photo Previews */}
                                    {photoPreviews.length > 0 && (
                                        <div>
                                            <Label className="mb-2 block">Selected Photos ({photoPreviews.length})</Label>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                                {photoPreviews.map((preview, index) => (
                                                    <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removePhoto(index)}
                                                            className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                                                        >
                                                            <X className="size-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* System-Managed Fields Info */}
                            <div className="rounded-2xl border border-[#0071b7]/20 bg-[#0071b7]/5 p-6 dark:border-[#0093dd]/20 dark:bg-[#0093dd]/5">
                                <div className="mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-[#0071b7] dark:text-[#0093dd]">
                                        Auto-Managed Fields
                                    </h2>
                                </div>
                                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                                    <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-neutral-900">
                                        <span>Work Order Number</span>
                                        <span className="font-mono text-[#0071b7] dark:text-[#0093dd]">
                                            Auto-generated
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-neutral-900">
                                        <span>Work Order Date</span>
                                        <span className="font-medium">Today's date</span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-neutral-900">
                                        <span>Initial Status</span>
                                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                                            Pending HOD Review
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-neutral-900">
                                        <span>Reporter</span>
                                        <span className="font-medium">Current user</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3">
                                <Link href={workOrdersIndex.url()}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    disabled={processing}
                                    type="submit"
                                    className="bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-md shadow-[#0071b7]/25 hover:shadow-lg hover:shadow-[#0071b7]/30"
                                >
                                    {processing ? (
                                        <>
                                            <svg
                                                className="mr-2 size-4 animate-spin"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardList className="mr-2 size-4" />
                                            Create Work Order
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

WorkOrderCreate.layout = {
    breadcrumbs: [
        {
            title: 'Work Orders',
            href: workOrdersIndex(),
        },
        {
            title: 'Create Work Order',
            href: '/work-orders/create',
        },
    ],
};
