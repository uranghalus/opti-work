import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index as planningIndex, store as planningStore } from '@/routes/work-planning';

type WorkOrderOption = {
    id_work_order: number;
    no_work_order: string;
    rincian_pekerjaan: string;
    department_tujuan: string | null;
    lokasi: string | null;
    prioritas: string;
};

type Props = {
    workOrders: WorkOrderOption[];
    selectedWorkOrder?: { id_work_order: number; no_work_order: string } | null;
};

export default function WorkPlanningCreate({ workOrders, selectedWorkOrder }: Props) {
    return (
        <>
            <Head title="Buat Work Planning" />

            <div className="mx-auto w-full max-w-3xl space-y-6">
                <Link href={planningIndex.url()} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#0071b7]">
                    <ArrowLeft className="size-4" /> Kembali ke Work Planning
                </Link>

                <div className="rounded-2xl bg-linear-to-br from-[#0071b7] via-[#0089cc] to-[#0093dd] p-8 shadow-lg">
                    <h1 className="text-3xl font-bold text-white">Buat Work Planning</h1>
                    <p className="mt-2 text-sm text-white/80">Jadwalkan work order kategori Normal</p>
                </div>

                <Form
                    method="post"
                    action={planningStore.url()}
                    className="space-y-5 rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                    {({ processing, errors }) => (
                        <>
                            <div>
                                <Label htmlFor="id_work_order">Work Order (Normal)</Label>
                                <select
                                    id="id_work_order"
                                    name="id_work_order"
                                    defaultValue={selectedWorkOrder?.id_work_order ?? ''}
                                    required
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                >
                                    <option value="" disabled>
                                        Pilih work order...
                                    </option>
                                    {workOrders.map((workOrder) => (
                                        <option key={workOrder.id_work_order} value={workOrder.id_work_order}>
                                            {workOrder.no_work_order} — {workOrder.rincian_pekerjaan} ({workOrder.department_tujuan ?? '-'})
                                        </option>
                                    ))}
                                </select>
                                {errors.id_work_order && <p className="mt-1 text-sm text-red-500">{errors.id_work_order}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="tgl_jadwal">Tanggal Jadwal</Label>
                                    <Input id="tgl_jadwal" name="tgl_jadwal" type="date" required className="mt-1" />
                                    {errors.tgl_jadwal && <p className="mt-1 text-sm text-red-500">{errors.tgl_jadwal}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="jenis_pekerjaan">Jenis Pekerjaan</Label>
                                    <select
                                        id="jenis_pekerjaan"
                                        name="jenis_pekerjaan"
                                        defaultValue="Preventive"
                                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    >
                                        {['Preventive', 'Corrective', 'Emergency', 'Renovasi', 'Lainnya'].map((jenis) => (
                                            <option key={jenis}>{jenis}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="jam_mulai">Jam Mulai</Label>
                                    <Input id="jam_mulai" name="jam_mulai" type="time" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="jam_selesai">Jam Selesai</Label>
                                    <Input id="jam_selesai" name="jam_selesai" type="time" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="lama_pekerjaan_hari">Lama Pekerjaan (hari)</Label>
                                    <Input id="lama_pekerjaan_hari" name="lama_pekerjaan_hari" type="number" min={1} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="budget">Budget (Rp)</Label>
                                    <Input id="budget" name="budget" type="number" min={0} step="0.01" className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="catatan">Catatan</Label>
                                <Textarea id="catatan" name="catatan" rows={3} className="mt-1" />
                            </div>

                            <div className="flex justify-end">
                                <Button disabled={processing} className="bg-linear-to-r from-[#0071b7] to-[#0093dd]">
                                    {processing ? 'Menyimpan...' : 'Simpan Work Planning'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

WorkPlanningCreate.layout = {
    breadcrumbs: [{ title: 'Work Planning', href: '/work-planning' }, { title: 'Buat', href: '' }],
};
