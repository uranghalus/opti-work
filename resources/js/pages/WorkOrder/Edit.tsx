import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ClipboardList,
    FileText,
    AlertCircle,
    AlertTriangle,
    MapPin,
    Building2,
    Camera,
    X,
    Image,
} from 'lucide-react';
import { useState } from 'react';

import Combobox from '@/components/combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as workOrdersIndex } from '@/routes/work-orders';

type Department = {
    id_department: string;
    nama_department: string;
    kode_department?: string;
};

type Tenant = {
    id: number;
    name: string;
};

type WorkOrder = {
    id_work_order: number;
    no_work_order: string;
    rincian_pekerjaan: string | null;
    department_tujuan: string | null;
    lokasi: string | null;
    tenant_id: string | null;
    priority_type: string | null;
    urgent_sub_type: string | null;
    prioritas: string | null;
    keterangan: string | null;
    incident_photos_urls: string[];
};

type PageProps = {
    workOrder: WorkOrder;
    departments: Department[];
    tenants: Tenant[];
};

export default function WorkOrderEdit({ workOrder, departments, tenants }: PageProps) {
    const [selectedDepartment, setSelectedDepartment] = useState(workOrder.department_tujuan || '');
    const [locationType, setLocationType] = useState(workOrder.tenant_id ? 'tenant' : 'location');
    const [selectedTenant, setSelectedTenant] = useState(workOrder.tenant_id || '');
    const [priorityType, setPriorityType] = useState(workOrder.priority_type || 'normal');
    const [urgentSubType, setUrgentSubType] = useState(workOrder.urgent_sub_type || '');
    const [priorityLevel, setPriorityLevel] = useState(workOrder.prioritas || 'medium');
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [existingPhotos, setExistingPhotos] = useState<string[]>(workOrder.incident_photos_urls || []);
    const [photosToRemove, setPhotosToRemove] = useState<string[]>([]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedPhotos(files);

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

    const removeNewPhoto = (index: number) => {
        const newPhotos = selectedPhotos.filter((_, i) => i !== index);
        const newPreviews = photoPreviews.filter((_, i) => i !== index);
        setSelectedPhotos(newPhotos);
        setPhotoPreviews(newPreviews);
    };

    const removeExistingPhoto = (index: number) => {
        const photoPath = existingPhotos[index];
        setPhotosToRemove([...photosToRemove, photoPath]);
        setExistingPhotos(existingPhotos.filter((_, i) => i !== index));
    };

    return (
        <>
            <Head title={`Edit - ${workOrder.no_work_order}`} />

            <div className="mx-auto w-full max-w-3xl space-y-8">
                {/* Back Link */}
                <Link
                    href={`/work-orders/${workOrder.id_work_order}`}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-all hover:text-[#0071b7] hover:translate-x-[-4px] dark:text-neutral-400 dark:hover:text-[#0093dd]"
                >
                    <div className="flex size-7 items-center justify-center rounded-lg bg-neutral-100 transition-colors group-hover:bg-[#0071b7]/10 dark:bg-neutral-800 dark:group-hover:bg-[#0093dd]/10">
                        <ArrowLeft className="size-4" />
                    </div>
                    <span>Back to Details</span>
                </Link>

                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0071b7] via-[#0089cc] to-[#0093dd] p-8 shadow-lg">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 size-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 left-0 -mb-12 -ml-12 size-40 rounded-full bg-white/5 blur-3xl" />
                    <div className="relative flex items-start justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                <ClipboardList className="size-3.5" />
                                {workOrder.no_work_order}
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                Edit Work Order
                            </h1>
                            <p className="mt-2 text-sm text-white/90">
                                Update the work order details below
                            </p>
                        </div>
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm ring-4 ring-white/10">
                            <ClipboardList className="size-8 text-white" />
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Form
                    action={`/work-orders/${workOrder.id_work_order}`}
                    method="post"
                    encType="multipart/form-data"
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="PUT" />

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
                                        <Label htmlFor="department_tujuan">
                                            Departemen Tujuan
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Combobox
                                            options={departments.map((dept) => ({
                                                label: dept.nama_department,
                                                value: dept.nama_department,
                                            }))}
                                            value={selectedDepartment}
                                            onChange={(value) => setSelectedDepartment(value)}
                                            placeholder="Select department"
                                        />
                                        <input
                                            type="hidden"
                                            name="department"
                                            value={selectedDepartment}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="rincian_pekerjaan">
                                            Work Description{' '}
                                            <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="rincian_pekerjaan"
                                            name="rincian_pekerjaan"
                                            defaultValue={workOrder.rincian_pekerjaan || ''}
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
                                        <Label>Location Type <span className="text-red-500">*</span></Label>

                                        {/* Modern Segmented Control */}
                                        <div className="relative flex rounded-lg border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-700 dark:bg-neutral-800">
                                            {/* Sliding Indicator */}
                                            <div
                                                className="absolute top-1 bottom-1 rounded-md bg-white shadow-sm transition-all duration-300 ease-in-out dark:bg-neutral-900"
                                                style={{
                                                    left: locationType === 'location' ? '4px' : 'calc(50% + 2px)',
                                                    width: 'calc(50% - 6px)',
                                                }}
                                            />

                                            {/* Location Button */}
                                            <button
                                                type="button"
                                                onClick={() => setLocationType('location')}
                                                className="relative z-10 flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors duration-200"
                                            >
                                                <MapPin className={`size-4 transition-colors ${locationType === 'location'
                                                    ? 'text-[#0071b7] dark:text-[#0093dd]'
                                                    : 'text-neutral-500 dark:text-neutral-400'
                                                    }`} />
                                                <span className={
                                                    locationType === 'location'
                                                        ? 'text-neutral-900 dark:text-white'
                                                        : 'text-neutral-600 dark:text-neutral-400'
                                                }>
                                                    Location
                                                </span>
                                            </button>

                                            {/* Tenant Button */}
                                            <button
                                                type="button"
                                                onClick={() => setLocationType('tenant')}
                                                className="relative z-10 flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-colors duration-200"
                                            >
                                                <Building2 className={`size-4 transition-colors ${locationType === 'tenant'
                                                    ? 'text-[#0071b7] dark:text-[#0093dd]'
                                                    : 'text-neutral-500 dark:text-neutral-400'
                                                    }`} />
                                                <span className={
                                                    locationType === 'tenant'
                                                        ? 'text-neutral-900 dark:text-white'
                                                        : 'text-neutral-600 dark:text-neutral-400'
                                                }>
                                                    Tenant
                                                </span>
                                            </button>
                                        </div>

                                        {/* Conditional Input with Animation */}
                                        <div className="relative overflow-hidden">
                                            <div
                                                className="transition-all duration-300 ease-in-out"
                                                style={{
                                                    opacity: locationType === 'location' ? 1 : 0,
                                                    transform: locationType === 'location' ? 'translateY(0)' : 'translateY(-8px)',
                                                    position: locationType === 'location' ? 'relative' : 'absolute',
                                                    pointerEvents: locationType === 'location' ? 'auto' : 'none',
                                                }}
                                            >
                                                <Input
                                                    id="lokasi"
                                                    name="lokasi"
                                                    defaultValue={workOrder.lokasi || ''}
                                                    placeholder="Enter work location or site address"
                                                    className="text-base"
                                                />
                                            </div>

                                            <div
                                                className="transition-all duration-300 ease-in-out"
                                                style={{
                                                    opacity: locationType === 'tenant' ? 1 : 0,
                                                    transform: locationType === 'tenant' ? 'translateY(0)' : 'translateY(-8px)',
                                                    position: locationType === 'tenant' ? 'relative' : 'absolute',
                                                    pointerEvents: locationType === 'tenant' ? 'auto' : 'none',
                                                }}
                                            >
                                                <Combobox
                                                    options={tenants.map((tenant) => ({
                                                        label: tenant.name,
                                                        value: tenant.id.toString(),
                                                    }))}
                                                    value={selectedTenant}
                                                    onChange={(value) => setSelectedTenant(value)}
                                                    placeholder="Search and select tenant..."
                                                />
                                            </div>
                                        </div>

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
                                <div className="mb-5 flex items-center gap-2">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-sm">
                                        <AlertTriangle className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            Priority & Classification
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Set urgency and priority levels
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {/* Priority Type - Modern Segmented Control */}
                                    <div className="grid gap-3">
                                        <Label>
                                            Priority Type{' '}
                                            <span className="text-red-500">*</span>
                                        </Label>

                                        {/* Modern Segmented Control with Sliding Indicator */}
                                        <div className="relative flex rounded-lg border border-neutral-200 bg-neutral-100 p-1 dark:border-neutral-700 dark:bg-neutral-800">
                                            {/* Sliding Indicator */}
                                            <div
                                                className="absolute top-1 bottom-1 rounded-md bg-white shadow-md transition-all duration-300 ease-in-out dark:bg-neutral-900"
                                                style={{
                                                    left: priorityType === 'normal' ? '4px' : 'calc(50% + 2px)',
                                                    width: 'calc(50% - 6px)',
                                                }}
                                            />

                                            {/* Normal Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPriorityType('normal');
                                                    setUrgentSubType('');
                                                }}
                                                className="relative z-10 flex-1 flex items-center justify-center gap-2 rounded-md py-3 text-sm font-medium transition-all duration-200"
                                            >
                                                <div className={`flex items-center gap-2`}>
                                                    <div className={`size-3 rounded-full transition-all ${priorityType === 'normal'
                                                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                                                        : 'bg-neutral-400 dark:bg-neutral-600'
                                                        }`} />
                                                    <span className={
                                                        priorityType === 'normal'
                                                            ? 'text-emerald-700 dark:text-emerald-400'
                                                            : 'text-neutral-600 dark:text-neutral-400'
                                                    }>
                                                        Normal
                                                    </span>
                                                </div>
                                            </button>

                                            {/* Urgent Button */}
                                            <button
                                                type="button"
                                                onClick={() => setPriorityType('urgent')}
                                                className="relative z-10 flex-1 flex items-center justify-center gap-2 rounded-md py-3 text-sm font-medium transition-all duration-200"
                                            >
                                                <div className={`flex items-center gap-2`}>
                                                    <div className={`size-3 rounded-full transition-all ${priorityType === 'urgent'
                                                        ? 'bg-red-500 shadow-sm shadow-red-500/50 animate-pulse'
                                                        : 'bg-neutral-400 dark:bg-neutral-600'
                                                        }`} />
                                                    <span className={
                                                        priorityType === 'urgent'
                                                            ? 'text-red-700 dark:text-red-400'
                                                            : 'text-neutral-600 dark:text-neutral-400'
                                                    }>
                                                        Urgent
                                                    </span>
                                                </div>
                                            </button>
                                        </div>

                                        {/* Priority Description */}
                                        <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
                                            {priorityType === 'normal' ? (
                                                <>
                                                    <div className="mt-0.5 size-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20" />
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                                                            Standard Processing
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                                                            Work order will be processed according to normal schedule and workflow
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="mt-0.5 size-5 rounded-full bg-red-100 dark:bg-red-500/20" />
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium text-red-800 dark:text-red-300">
                                                            Immediate Attention Required
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400">
                                                            This work order requires urgent handling and priority scheduling
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

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

                                    {/* Urgent Sub-Type - Animated Reveal */}
                                    <div
                                        className="overflow-hidden transition-all duration-300 ease-in-out"
                                        style={{
                                            maxHeight: priorityType === 'urgent' ? '500px' : '0',
                                            opacity: priorityType === 'urgent' ? 1 : 0,
                                        }}
                                    >
                                        {priorityType === 'urgent' && (
                                            <div className="grid gap-3 pt-2">
                                                <Label>
                                                    Urgent Type{' '}
                                                    <span className="text-red-500">*</span>
                                                </Label>

                                                {/* Urgent Type Cards */}
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {/* By Accident Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setUrgentSubType('by_accident')}
                                                        className={`relative overflow-hidden rounded-lg border-2 p-4 text-left transition-all duration-200 ${urgentSubType === 'by_accident'
                                                            ? 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-500/10'
                                                            : 'border-neutral-200 bg-white hover:border-red-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-red-500/50'
                                                            }`}
                                                    >
                                                        {urgentSubType === 'by_accident' && (
                                                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent dark:from-red-500/10" />
                                                        )}
                                                        <div className="relative">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <div className={`flex size-8 items-center justify-center rounded-lg ${urgentSubType === 'by_accident'
                                                                    ? 'bg-red-500 text-white'
                                                                    : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                                                                    }`}>
                                                                    <AlertTriangle className="size-4" />
                                                                </div>
                                                                <span className={`text-sm font-semibold ${urgentSubType === 'by_accident'
                                                                    ? 'text-red-900 dark:text-red-100'
                                                                    : 'text-neutral-900 dark:text-white'
                                                                    }`}>
                                                                    By Accident
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                Emergency situation requiring immediate action
                                                            </p>
                                                        </div>
                                                    </button>

                                                    {/* By Owner Card */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setUrgentSubType('by_owner')}
                                                        className={`relative overflow-hidden rounded-lg border-2 p-4 text-left transition-all duration-200 ${urgentSubType === 'by_owner'
                                                            ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-500/10'
                                                            : 'border-neutral-200 bg-white hover:border-amber-300 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-amber-500/50'
                                                            }`}
                                                    >
                                                        {urgentSubType === 'by_owner' && (
                                                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10" />
                                                        )}
                                                        <div className="relative">
                                                            <div className="mb-2 flex items-center gap-2">
                                                                <div className={`flex size-8 items-center justify-center rounded-lg ${urgentSubType === 'by_owner'
                                                                    ? 'bg-amber-500 text-white'
                                                                    : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                                                    }`}>
                                                                    <AlertCircle className="size-4" />
                                                                </div>
                                                                <span className={`text-sm font-semibold ${urgentSubType === 'by_owner'
                                                                    ? 'text-amber-900 dark:text-amber-100'
                                                                    : 'text-neutral-900 dark:text-white'
                                                                    }`}>
                                                                    By Owner
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                                                Urgent request from property owner
                                                            </p>
                                                        </div>
                                                    </button>
                                                </div>

                                                <input
                                                    type="hidden"
                                                    name="urgent_sub_type"
                                                    value={urgentSubType}
                                                />

                                                {/* Warning Notice for By Accident */}
                                                {urgentSubType === 'by_accident' && (
                                                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-500/20">
                                                            <AlertTriangle className="size-4 text-amber-700 dark:text-amber-400" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                                                Immediate Execution Required
                                                            </p>
                                                            <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                                                                HOD must execute this work immediately. Scheduling is not allowed for emergency situations.
                                                            </p>
                                                        </div>
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
                                    </div>

                                    {/* Priority Level - Radio Button Cards */}
                                    <div className="grid gap-3">
                                        <Label>
                                            Priority Level{' '}
                                            <span className="text-red-500">*</span>
                                        </Label>

                                        {/* Priority Level Radio Cards */}
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            {/* Low Priority */}
                                            <label
                                                className={`relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 ${priorityLevel === 'low'
                                                    ? 'border-emerald-500 bg-emerald-50 shadow-md dark:border-emerald-400 dark:bg-emerald-500/10'
                                                    : 'border-neutral-200 bg-white hover:border-emerald-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-emerald-500/50'
                                                    }`}
                                                onClick={() => setPriorityLevel('low')}
                                            >
                                                <input type="radio" name="prioritas" value="low" checked={priorityLevel === 'low'} onChange={() => setPriorityLevel('low')} className="hidden" />
                                                {priorityLevel === 'low' && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent dark:from-emerald-500/10" />
                                                )}
                                                <div className="relative">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
                                                        <span className="text-lg font-bold text-white">L</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                        Low
                                                    </p>
                                                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                        Flexible scheduling
                                                    </p>
                                                    <div className="mt-2 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                        7-14 days
                                                    </div>
                                                </div>
                                            </label>

                                            {/* Medium Priority */}
                                            <label
                                                className={`relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 ${priorityLevel === 'medium'
                                                    ? 'border-amber-500 bg-amber-50 shadow-md dark:border-amber-400 dark:bg-amber-500/10'
                                                    : 'border-neutral-200 bg-white hover:border-amber-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-amber-500/50'
                                                    }`}
                                                onClick={() => setPriorityLevel('medium')}
                                            >
                                                <input type="radio" name="prioritas" value="medium" checked={priorityLevel === 'medium'} onChange={() => setPriorityLevel('medium')} className="hidden" />
                                                {priorityLevel === 'medium' && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent dark:from-amber-500/10" />
                                                )}
                                                <div className="relative">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
                                                        <span className="text-lg font-bold text-white">M</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                        Medium
                                                    </p>
                                                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                        Standard scheduling
                                                    </p>
                                                    <div className="mt-2 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                                        3-7 days
                                                    </div>
                                                </div>
                                            </label>

                                            {/* High Priority */}
                                            <label
                                                className={`relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 ${priorityLevel === 'high'
                                                    ? 'border-red-500 bg-red-50 shadow-md dark:border-red-400 dark:bg-red-500/10'
                                                    : 'border-neutral-200 bg-white hover:border-red-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-red-500/50'
                                                    }`}
                                                onClick={() => setPriorityLevel('high')}
                                            >
                                                <input type="radio" name="prioritas" value="high" checked={priorityLevel === 'high'} onChange={() => setPriorityLevel('high')} className="hidden" />
                                                {priorityLevel === 'high' && (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent dark:from-red-500/10" />
                                                )}
                                                <div className="relative">
                                                    <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-red-600 shadow-sm">
                                                        <span className="text-lg font-bold text-white">H</span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                        High
                                                    </p>
                                                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                                                        Priority scheduling
                                                    </p>
                                                    <div className="mt-2 rounded-full bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700 dark:bg-red-500/20 dark:text-red-400">
                                                        1-3 days
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        {errors.prioritas && (
                                            <p className="flex items-center gap-1 text-xs text-red-500">
                                                <AlertCircle className="size-3" />
                                                {errors.prioritas}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="group rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm transition-transform group-hover:scale-110">
                                        <FileText className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            Additional Notes
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Provide any extra context or details
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <textarea
                                        id="keterangan"
                                        name="keterangan"
                                        rows={5}
                                        defaultValue={workOrder.keterangan || ''}
                                        className="flex w-full rounded-lg border-2 border-neutral-200 bg-gradient-to-br from-white to-neutral-50 px-4 py-3 text-sm shadow-sm transition-all placeholder:text-neutral-400 hover:border-neutral-300 hover:shadow-sm focus:border-[#0071b7] focus:ring-[3px] focus:ring-[#0071b7]/20 focus:outline-none dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-800 dark:placeholder:text-neutral-500 dark:focus:border-[#0093dd]"
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
                            <div className="group rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-sm transition-transform group-hover:scale-110">
                                        <Camera className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                            Incident Photos
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Upload visual documentation
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-4">
                                    {/* Existing Photos */}
                                    {existingPhotos.length > 0 && (
                                        <div>
                                            <Label className="mb-3 flex items-center gap-2">
                                                <span>Existing Photos</span>
                                                <span className="rounded-full bg-[#0071b7]/10 px-2 py-0.5 text-xs font-semibold text-[#0071b7] dark:bg-[#0093dd]/20 dark:text-[#0093dd]">
                                                    {existingPhotos.length}
                                                </span>
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                                {existingPhotos.map((photo, index) => (
                                                    <div key={index} className="group/photo relative aspect-square overflow-hidden rounded-xl border-2 border-neutral-200 shadow-sm transition-all hover:shadow-md dark:border-neutral-700">
                                                        <img
                                                            src={photo}
                                                            alt={`Existing photo ${index + 1}`}
                                                            className="h-full w-full object-cover transition-transform group-hover/photo:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover/photo:opacity-100" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingPhoto(index)}
                                                            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-all hover:scale-110 group-hover/photo:opacity-100"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <input
                                                type="hidden"
                                                name="remove_photos[]"
                                                value={photosToRemove.join(',')}
                                            />
                                        </div>
                                    )}

                                    {/* Upload New Photos */}
                                    <div>
                                        <Label htmlFor="incident_photos">
                                            Add More Photos{' '}
                                            <span className="text-xs text-neutral-400">(Optional, max 5MB each)</span>
                                        </Label>
                                        <div className="mt-2">
                                            <label
                                                htmlFor="incident_photos"
                                                className="group/upload flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-gradient-to-br from-neutral-50 to-white px-6 py-10 transition-all hover:border-[#0071b7] hover:bg-gradient-to-br hover:from-[#0071b7]/5 hover:to-[#0093dd]/5 hover:shadow-md dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-900 dark:hover:border-[#0093dd]"
                                            >
                                                <div className="mb-3 flex size-14 items-center justify-center rounded-xl bg-neutral-100 transition-all group-hover/upload:bg-[#0071b7]/10 dark:bg-neutral-800 dark:group-hover/upload:bg-[#0093dd]/10">
                                                    <Image className="size-7 text-neutral-400 transition-colors group-hover/upload:text-[#0071b7] dark:group-hover/upload:text-[#0093dd]" />
                                                </div>
                                                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
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

                                    {/* New Photo Previews */}
                                    {photoPreviews.length > 0 && (
                                        <div>
                                            <Label className="mb-3 flex items-center gap-2">
                                                <span>New Photos</span>
                                                <span className="rounded-full bg-[#0071b7]/10 px-2 py-0.5 text-xs font-semibold text-[#0071b7] dark:bg-[#0093dd]/20 dark:text-[#0093dd]">
                                                    {photoPreviews.length}
                                                </span>
                                            </Label>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                                {photoPreviews.map((preview, index) => (
                                                    <div key={index} className="group/photo relative aspect-square overflow-hidden rounded-xl border-2 border-neutral-200 shadow-sm transition-all hover:shadow-md dark:border-neutral-700">
                                                        <img
                                                            src={preview}
                                                            alt={`New preview ${index + 1}`}
                                                            className="h-full w-full object-cover transition-transform group-hover/photo:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover/photo:opacity-100" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewPhoto(index)}
                                                            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-all hover:scale-110 group-hover/photo:opacity-100"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <Link href={`/work-orders/${workOrder.id_work_order}`}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 border-2 border-neutral-200 px-6 transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-sm dark:border-neutral-700 dark:hover:bg-neutral-800"
                                    >
                                        <ArrowLeft className="mr-2 size-4" />
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    disabled={processing}
                                    type="submit"
                                    className="h-12 min-w-[200px] bg-gradient-to-r from-[#0071b7] to-[#0093dd] text-base font-semibold text-white shadow-lg shadow-[#0071b7]/30 transition-all hover:shadow-xl hover:shadow-[#0071b7]/40 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
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
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardList className="mr-2 size-4" />
                                            Update Work Order
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

WorkOrderEdit.layout = {
    breadcrumbs: [
        {
            title: 'Work Orders',
            href: workOrdersIndex(),
        },
        {
            title: 'Edit Work Order',
            href: '#',
        },
    ],
};
