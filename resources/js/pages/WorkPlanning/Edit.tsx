import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index as planningIndex, update as planningUpdate } from '@/routes/work-planning';

type WorkPlanning = {
    id: number;
    id_work_order: number;
    tgl_jadwal: string;
    jam_mulai: string | null;
    jam_selesai: string | null;
    jenis_pekerjaan: string | null;
    lama_pekerjaan_hari: number | null;
    budget: string | null;
    status_jadwal: string;
    catatan: string | null;
    work_order?: { id_work_order: number; no_work_order: string; rincian_pekerjaan: string };
};

const statuses = ['planned', 'scheduled', 'in_progress', 'completed', 'cancelled'];

export default function WorkPlanningEdit({ workPlanning }: { workPlanning: WorkPlanning }) {
    return (
        <>
            <Head title={`Edit Work Planning - ${workPlanning.work_order?.no_work_order ?? ''}`} />

            <div className="mx-auto w-full max-w-3xl space-y-6">
                <Link href={planningIndex.url()} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#0071b7]">
                    <ArrowLeft className="size-4" /> Kembali ke Work Planning
                </Link>

                <div className="rounded-2xl bg-linear-to-br from-[#0071b7] via-[#0089cc] to-[#0093dd] p-8 shadow-lg">
                    <h1 className="text-3xl font-bold text-white">Edit Work Planning</h1>
                    <p className="mt-2 text-sm text-white/80">{workPlanning.work_order?.no_work_order ?? `WO #${workPlanning.id_work_order}`}</p>
                </div>

                <Form
                    method="post"
                    action={planningUpdate.url({ work_planning: workPlanning.id })}
                    className="space-y-5 rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                >
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="_method" value="PUT" />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="tgl_jadwal">Tanggal Jadwal</Label>
                                    <Input id="tgl_jadwal" name="tgl_jadwal" type="date" defaultValue={workPlanning.tgl_jadwal} required className="mt-1" />
                                    {errors.tgl_jadwal && <p className="mt-1 text-sm text-red-500">{errors.tgl_jadwal}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="status_jadwal">Status</Label>
                                    <select
                                        id="status_jadwal"
                                        name="status_jadwal"
                                        defaultValue={workPlanning.status_jadwal}
                                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm capitalize dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    >
                                        {statuses.map((status) => (
                                            <option key={status} value={status} className="capitalize">
                                                {status.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="jam_mulai">Jam Mulai</Label>
                                    <Input id="jam_mulai" name="jam_mulai" type="time" defaultValue={workPlanning.jam_mulai ?? ''} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="jam_selesai">Jam Selesai</Label>
                                    <Input id="jam_selesai" name="jam_selesai" type="time" defaultValue={workPlanning.jam_selesai ?? ''} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="jenis_pekerjaan">Jenis Pekerjaan</Label>
                                    <Input id="jenis_pekerjaan" name="jenis_pekerjaan" defaultValue={workPlanning.jenis_pekerjaan ?? ''} className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="lama_pekerjaan_hari">Lama Pekerjaan (hari)</Label>
                                    <Input
                                        id="lama_pekerjaan_hari"
                                        name="lama_pekerjaan_hari"
                                        type="number"
                                        min={1}
                                        defaultValue={workPlanning.lama_pekerjaan_hari ?? ''}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="budget">Budget (Rp)</Label>
                                    <Input id="budget" name="budget" type="number" min={0} step="0.01" defaultValue={workPlanning.budget ?? ''} className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="catatan">Catatan</Label>
                                <Textarea id="catatan" name="catatan" rows={3} defaultValue={workPlanning.catatan ?? ''} className="mt-1" />
                            </div>

                            <div className="flex justify-end">
                                <Button disabled={processing} className="bg-linear-to-r from-[#0071b7] to-[#0093dd]">
                                    {processing ? 'Menyimpan...' : 'Update Work Planning'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

WorkPlanningEdit.layout = {
    breadcrumbs: [{ title: 'Work Planning', href: '/work-planning' }, { title: 'Edit', href: '' }],
};
