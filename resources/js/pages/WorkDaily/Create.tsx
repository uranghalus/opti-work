import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index as dailyIndex, store as dailyStore } from '@/routes/work-daily';

type EmployeeOption = {
    id_employee: string;
    nik_employee: string;
    nama_employee: string;
    id_department: string | null;
};

type WorkDataOption = {
    id_work_data: number;
    no_kerja: string;
    status_pekerjaan: string;
};

type Props = {
    employees: EmployeeOption[];
    workDatas: WorkDataOption[];
};

export default function WorkDailyCreate({ employees, workDatas }: Props) {
    return (
        <>
            <Head title="Tetapkan Pekerjaan Harian" />

            <div className="mx-auto w-full max-w-3xl space-y-6">
                <Link href={dailyIndex.url()} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#0071b7]">
                    <ArrowLeft className="size-4" /> Kembali ke Work Daily
                </Link>

                <div className="rounded-2xl bg-linear-to-br from-[#0071b7] via-[#0089cc] to-[#0093dd] p-8 shadow-lg">
                    <h1 className="text-3xl font-bold text-white">Tetapkan Pekerjaan Harian</h1>
                    <p className="mt-2 text-sm text-white/80">Penetapan daily work oleh HOD untuk karyawan</p>
                </div>

                <Form
                    method="post"
                    action={dailyStore.url()}
                    className="space-y-5 rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                    {({ processing, errors }) => (
                        <>
                            <div>
                                <Label htmlFor="id_employee">Karyawan Pelaksana</Label>
                                <select
                                    id="id_employee"
                                    name="id_employee"
                                    required
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                >
                                    <option value="" disabled>
                                        Pilih karyawan...
                                    </option>
                                    {employees.map((employee) => (
                                        <option key={employee.id_employee} value={employee.id_employee}>
                                            {employee.nama_employee} ({employee.nik_employee})
                                        </option>
                                    ))}
                                </select>
                                {errors.id_employee && <p className="mt-1 text-sm text-red-500">{errors.id_employee}</p>}
                            </div>

                            <div>
                                <Label htmlFor="id_work_data">No. SPK (Work Data)</Label>
                                <select
                                    id="id_work_data"
                                    name="id_work_data"
                                    required
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                >
                                    <option value="" disabled>
                                        Pilih SPK...
                                    </option>
                                    {workDatas.map((workData) => (
                                        <option key={workData.id_work_data} value={workData.id_work_data}>
                                            {workData.no_kerja} — {workData.status_pekerjaan}
                                        </option>
                                    ))}
                                </select>
                                {errors.id_work_data && <p className="mt-1 text-sm text-red-500">{errors.id_work_data}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="tanggal_kerja">Tanggal Kerja</Label>
                                    <Input id="tanggal_kerja" name="tanggal_kerja" type="date" required className="mt-1" />
                                    {errors.tanggal_kerja && <p className="mt-1 text-sm text-red-500">{errors.tanggal_kerja}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="prioritas">Prioritas</Label>
                                    <select
                                        id="prioritas"
                                        name="prioritas"
                                        defaultValue="medium"
                                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    >
                                        <option value="low">low</option>
                                        <option value="medium">medium</option>
                                        <option value="high">high</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="aktivitas_hari_ini">Aktivitas Harian</Label>
                                <Textarea id="aktivitas_hari_ini" name="aktivitas_hari_ini" rows={4} required className="mt-1" />
                                {errors.aktivitas_hari_ini && <p className="mt-1 text-sm text-red-500">{errors.aktivitas_hari_ini}</p>}
                            </div>

                            <div>
                                <Label htmlFor="kendala_lapangan">Kendala (opsional)</Label>
                                <Textarea id="kendala_lapangan" name="kendala_lapangan" rows={2} className="mt-1" />
                            </div>

                            <div className="flex justify-end">
                                <Button disabled={processing} className="bg-linear-to-r from-[#0071b7] to-[#0093dd]">
                                    {processing ? 'Menyimpan...' : 'Tetapkan Pekerjaan'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

WorkDailyCreate.layout = {
    breadcrumbs: [{ title: 'Work Daily', href: '/work-daily' }, { title: 'Tetapkan', href: '' }],
};
