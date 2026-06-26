import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Calendar, Building2, User, Upload, AlertCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/workflow/StatusBadge';
import { index as workDataIndex, update as workDataUpdate } from '@/routes/work-data';

type WorkData = {
    id_work_data: number;
    no_kerja: string;
    tanggal_work_data: string | null;
    deskripsi: string | null;
    status_pekerjaan: string | null;
    nama_tenant: string | null;
    work_department: string | null;
    kode_inventory: string | null;
    prediksi_penyebab: string | null;
    tindakan: string | null;
    hasil_kesimpulan: string | null;
    saran_solusi: string | null;
    gambar_sebelum: string | null;
    gambar_sesudah: string | null;
    create_date: string;
};

type PageProps = {
    workData: WorkData;
};

export default function WorkDataShow({ workData }: PageProps) {
    const [beforeImage, setBeforeImage] = useState<File | null>(null);
    const [afterImage, setAfterImage] = useState<File | null>(null);
    const [beforePreview, setBeforePreview] = useState<string | null>(null);
    const [afterPreview, setAfterPreview] = useState<string | null>(null);

    const handleBeforeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setBeforeImage(file);
            setBeforePreview(URL.createObjectURL(file));
        }
    };

    const handleAfterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            setAfterImage(file);
            setAfterPreview(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <Head title={`Work Data - ${workData.no_kerja}`} />

            <div className="mx-auto w-full max-w-6xl space-y-6">
                {/* Back Link */}
                <Link
                    href={workDataIndex.url()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-[#0071b7] dark:text-neutral-400 dark:hover:text-[#0093dd]"
                >
                    <ArrowLeft className="size-4" />
                    Back to Work Data
                </Link>

                {/* Header with Gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#0071b7] via-[#0089cc] to-[#0093dd] p-8 shadow-lg">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 size-32 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 left-0 -mb-12 -ml-12 size-40 rounded-full bg-white/5 blur-3xl" />
                    <div className="relative flex items-start justify-between">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                <FileText className="size-3.5" />
                                Work Data Details
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                {workData.no_kerja}
                            </h1>
                            <p className="mt-2 text-sm text-white/80">
                                Work order execution data and analysis
                            </p>
                        </div>
                        <StatusBadge status={workData.status_pekerjaan || 'draft'} className="bg-white/20 text-white backdrop-blur-sm" />
                    </div>
                </div>

                {/* Work Data Information */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Basic Information */}
                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center gap-2">
                            <FileText className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                Basic Information
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-xs text-neutral-500">Work Number</Label>
                                <p className="mt-1 font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                                    {workData.no_kerja}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-neutral-500">Work Date</Label>
                                <p className="mt-1 flex items-center gap-2 text-sm text-neutral-900 dark:text-white">
                                    <Calendar className="size-4" />
                                    {workData.tanggal_work_data
                                        ? new Date(workData.tanggal_work_data).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-neutral-500">Department</Label>
                                <p className="mt-1 flex items-center gap-2 text-sm text-neutral-900 dark:text-white">
                                    <Building2 className="size-4" />
                                    {workData.work_department || '-'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-neutral-500">Tenant</Label>
                                <p className="mt-1 flex items-center gap-2 text-sm text-neutral-900 dark:text-white">
                                    <User className="size-4" />
                                    {workData.nama_tenant || '-'}
                                </p>
                            </div>
                            <div>
                                <Label className="text-xs text-neutral-500">Inventory Code</Label>
                                <p className="mt-1 text-sm text-neutral-900 dark:text-white">
                                    {workData.kode_inventory || '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Work Description */}
                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center gap-2">
                            <FileText className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                Work Description
                            </h2>
                        </div>
                        <div>
                            <p className="text-sm leading-relaxed text-neutral-900 dark:text-white">
                                {workData.deskripsi || 'No description provided.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Analysis & Results */}
                <Form method="post" action={workDataUpdate.url(workData.id_work_data.toString())} className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="PUT" />

                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <AlertCircle className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                        Analysis & Results
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Root Cause Prediction */}
                                    <div>
                                        <Label htmlFor="prediksi_penyebab">Root Cause Prediction</Label>
                                        <Textarea
                                            id="prediksi_penyebab"
                                            name="prediksi_penyebab"
                                            defaultValue={workData.prediksi_penyebab || ''}
                                            placeholder="Predict the root cause of the issue..."
                                            rows={3}
                                            className="mt-1"
                                        />
                                        {errors.prediksi_penyebab && (
                                            <p className="mt-1 text-xs text-red-500">{errors.prediksi_penyebab}</p>
                                        )}
                                    </div>

                                    {/* Actions Taken */}
                                    <div>
                                        <Label htmlFor="tindakan">Actions Taken</Label>
                                        <Textarea
                                            id="tindakan"
                                            name="tindakan"
                                            defaultValue={workData.tindakan || ''}
                                            placeholder="Describe the actions taken to resolve the issue..."
                                            rows={3}
                                            className="mt-1"
                                        />
                                        {errors.tindakan && (
                                            <p className="mt-1 text-xs text-red-500">{errors.tindakan}</p>
                                        )}
                                    </div>

                                    {/* Results & Conclusion */}
                                    <div>
                                        <Label htmlFor="hasil_kesimpulan">Results & Conclusion</Label>
                                        <Textarea
                                            id="hasil_kesimpulan"
                                            name="hasil_kesimpulan"
                                            defaultValue={workData.hasil_kesimpulan || ''}
                                            placeholder="What was the result and conclusion?"
                                            rows={3}
                                            className="mt-1"
                                        />
                                        {errors.hasil_kesimpulan && (
                                            <p className="mt-1 text-xs text-red-500">{errors.hasil_kesimpulan}</p>
                                        )}
                                    </div>

                                    {/* Recommendations */}
                                    <div>
                                        <Label htmlFor="saran_solusi">Recommendations & Solutions</Label>
                                        <Textarea
                                            id="saran_solusi"
                                            name="saran_solusi"
                                            defaultValue={workData.saran_solusi || ''}
                                            placeholder="Provide recommendations for future improvements..."
                                            rows={3}
                                            className="mt-1"
                                        />
                                        {errors.saran_solusi && (
                                            <p className="mt-1 text-xs text-red-500">{errors.saran_solusi}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3">
                                <Link href={workDataIndex.url()}>
                                    <Button type="button" variant="outline">
                                        Back
                                    </Button>
                                </Link>
                                <Button
                                    disabled={processing}
                                    type="submit"
                                    className="bg-linear-to-r from-[#0071b7] to-[#0093dd] text-white shadow-md shadow-[#0071b7]/25 hover:shadow-lg hover:shadow-[#0071b7]/30"
                                >
                                    {processing ? 'Saving...' : 'Save Analysis'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                {/* Image Upload Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Before Image */}
                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center gap-2">
                            <Upload className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                Before Image
                            </h2>
                        </div>

                        {workData.gambar_sebelum || beforePreview ? (
                            <div className="mb-4 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                                <img
                                    src={beforePreview || `/storage/${workData.gambar_sebelum}`}
                                    alt="Before"
                                    className="w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="mb-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
                                <p className="text-sm text-neutral-500">No image uploaded</p>
                            </div>
                        )}

                        <Form
                            method="post"
                            action={`/work-data/${workData.id_work_data}/upload-before-image`}
                            encType="multipart/form-data"
                        >
                            {({ processing }) => (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBeforeImageChange}
                                        className="mb-2 w-full text-sm"
                                    />
                                    <Button
                                        disabled={processing || !beforeImage}
                                        type="submit"
                                        className="w-full"
                                        size="sm"
                                    >
                                        {processing ? 'Uploading...' : 'Upload Before Image'}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>

                    {/* After Image */}
                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-4 flex items-center gap-2">
                            <Upload className="size-5 text-[#0071b7] dark:text-[#0093dd]" />
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                After Image
                            </h2>
                        </div>

                        {workData.gambar_sesudah || afterPreview ? (
                            <div className="mb-4 overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                                <img
                                    src={afterPreview || `/storage/${workData.gambar_sesudah}`}
                                    alt="After"
                                    className="w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="mb-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
                                <p className="text-sm text-neutral-500">No image uploaded</p>
                            </div>
                        )}

                        <Form
                            method="post"
                            action={`/work-data/${workData.id_work_data}/upload-after-image`}
                            encType="multipart/form-data"
                        >
                            {({ processing }) => (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAfterImageChange}
                                        className="mb-2 w-full text-sm"
                                    />
                                    <Button
                                        disabled={processing || !afterImage}
                                        type="submit"
                                        className="w-full"
                                        size="sm"
                                    >
                                        {processing ? 'Uploading...' : 'Upload After Image'}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}

WorkDataShow.layout = {
    breadcrumbs: [
        {
            title: 'Work Data',
            href: workDataIndex(),
        },
        {
            title: 'Details',
            href: '#',
        },
    ],
};
