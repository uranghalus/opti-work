import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarClock, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as planningIndex, extend as planningExtend } from '@/routes/work-planning';

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
    original_tgl_jadwal: string | null;
    extend_count: number;
    extend_reason: string | null;
    extend_approval_notes: string | null;
    extend_requester?: { id: number; name: string } | null;
    extend_approver?: { id: number; name: string } | null;
    extend_approved_at: string | null;
    work_order?: {
        id_work_order: number;
        no_work_order: string;
        rincian_pekerjaan: string;
        department_tujuan: string | null;
        lokasi: string | null;
        prioritas: string;
        priority_type: string;
        status_pekerjaan: string | null;
        deadline_date: string | null;
    } | null;
};

type Props = {
    workPlanning: WorkPlanning;
};

const statusColors: Record<string, string> = {
    planned: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    pending_extend_approval: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
    rescheduled: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

const pretty = (value: string) => value.replace(/_/g, ' ');

export default function WorkPlanningShow({ workPlanning }: Props) {
    const { auth } = usePage().props;
    const roles: string[] = auth.roles ?? [];
    const isGm = roles.includes('general_manager') || roles.includes('deputy_general_manager');
    const isPendingExtend = workPlanning.status_jadwal === 'pending_extend_approval';
    const canRequestExtend = !isPendingExtend && ['planned', 'scheduled', 'rescheduled'].includes(workPlanning.status_jadwal);

    return (
        <>
            <Head title={`Work Planning - ${workPlanning.work_order?.no_work_order ?? workPlanning.id}`} />

            <div className="mx-auto w-full max-w-4xl space-y-6">
                <Link href={planningIndex.url()} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#0071b7]">
                    <ArrowLeft className="size-4" /> Kembali ke Work Planning
                </Link>

                <div className="rounded-2xl bg-linear-to-br from-[#0071b7] via-[#0089cc] to-[#0093dd] p-8 shadow-lg">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="mb-2 text-sm text-white/80">Work Planning</p>
                            <h1 className="text-3xl font-bold text-white">{workPlanning.work_order?.no_work_order ?? `WO #${workPlanning.id_work_order}`}</h1>
                        </div>
                        <Badge className={`capitalize ${statusColors[workPlanning.status_jadwal] || ''}`}>{pretty(workPlanning.status_jadwal)}</Badge>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="mb-4 font-semibold dark:text-white">Detail Jadwal</h2>
                        <dl className="space-y-3 text-sm">
                            {[
                                ['Tanggal Jadwal', workPlanning.tgl_jadwal],
                                ['Jadwal Awal', workPlanning.original_tgl_jadwal ?? '-'],
                                ['Jam', `${workPlanning.jam_mulai ?? '-'} s/d ${workPlanning.jam_selesai ?? '-'}`],
                                ['Jenis Pekerjaan', workPlanning.jenis_pekerjaan ?? '-'],
                                ['Durasi', workPlanning.lama_pekerjaan_hari ? `${workPlanning.lama_pekerjaan_hari} hari` : '-'],
                                ['Budget', workPlanning.budget ? `Rp ${Number(workPlanning.budget).toLocaleString('id-ID')}` : '-'],
                                ['Jumlah Extend', String(workPlanning.extend_count)],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between gap-4">
                                    <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
                                    <dd className="text-right font-medium dark:text-white">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="mb-4 font-semibold dark:text-white">Work Order Terkait</h2>
                        <dl className="space-y-3 text-sm">
                            {[
                                ['No WO', workPlanning.work_order?.no_work_order ?? '-'],
                                ['Department Tujuan', workPlanning.work_order?.department_tujuan ?? '-'],
                                ['Lokasi', workPlanning.work_order?.lokasi ?? '-'],
                                ['Prioritas', workPlanning.work_order?.prioritas ?? '-'],
                                ['Kategori', pretty(workPlanning.work_order?.priority_type ?? '-')],
                                ['Status WO', pretty(workPlanning.work_order?.status_pekerjaan ?? '-')],
                                ['Deadline WO', workPlanning.work_order?.deadline_date ?? '-'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between gap-4">
                                    <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
                                    <dd className="text-right font-medium dark:text-white">{value}</dd>
                                </div>
                            ))}
                        </dl>
                        <p className="mt-4 border-t pt-3 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                            {workPlanning.work_order?.rincian_pekerjaan}
                        </p>
                    </div>
                </div>

                {(workPlanning.extend_reason || workPlanning.extend_approval_notes) && (
                    <div className="rounded-2xl border border-orange-200/60 bg-orange-50 p-6 shadow-sm dark:border-orange-500/30 dark:bg-orange-500/10">
                        <h2 className="mb-3 flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400">
                            <CalendarClock className="size-4" /> Riwayat Extend
                        </h2>
                        <dl className="space-y-2 text-sm">
                            {workPlanning.extend_reason && (
                                <div>
                                    <dt className="text-neutral-500 dark:text-neutral-400">Alasan</dt>
                                    <dd className="dark:text-white">{workPlanning.extend_reason}</dd>
                                </div>
                            )}
                            {workPlanning.extend_requester && (
                                <div>
                                    <dt className="text-neutral-500 dark:text-neutral-400">Diajukan oleh</dt>
                                    <dd className="dark:text-white">{workPlanning.extend_requester.name}</dd>
                                </div>
                            )}
                            {workPlanning.extend_approval_notes && (
                                <div>
                                    <dt className="text-neutral-500 dark:text-neutral-400">Catatan Approval</dt>
                                    <dd className="dark:text-white">{workPlanning.extend_approval_notes}</dd>
                                </div>
                            )}
                            {workPlanning.extend_approver && (
                                <div>
                                    <dt className="text-neutral-500 dark:text-neutral-400">Disetujui oleh</dt>
                                    <dd className="dark:text-white">
                                        {workPlanning.extend_approver.name} {workPlanning.extend_approved_at ? `(${workPlanning.extend_approved_at})` : ''}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                )}

                {isPendingExtend && isGm && (
                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="mb-1 font-semibold dark:text-white">Approval Perpanjangan Jadwal</h2>
                        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
                            Pengajuan extend ke {workPlanning.tgl_jadwal}. Hanya DGM/GM yang dapat memproses.
                        </p>
                        <div className="flex flex-wrap items-end gap-2">
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => router.post(`/work-planning/${workPlanning.id}/extend/approve`, {})}
                            >
                                <CheckCircle2 className="size-4" /> Setujui
                            </Button>
                            <Button variant="destructive" onClick={() => router.post(`/work-planning/${workPlanning.id}/extend/reject`, {})}>
                                <XCircle className="size-4" /> Tolak
                            </Button>
                        </div>
                    </div>
                )}

                {canRequestExtend && (
                    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="mb-1 font-semibold dark:text-white">Ajukan Perpanjangan Jadwal</h2>
                        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">Perpanjangan jadwal wajib mendapat approval DGM/GM.</p>
                        <Form method="post" action={planningExtend.url({ work_planning: workPlanning.id })} className="space-y-4">
                            {({ processing, errors }) => (
                                <>
                                    <input type="hidden" name="_method" value="POST" />
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="tgl_jadwal">Tanggal Jadwal Baru</Label>
                                            <Input id="tgl_jadwal" name="tgl_jadwal" type="date" required className="mt-1" />
                                            {errors.tgl_jadwal && <p className="mt-1 text-sm text-red-500">{errors.tgl_jadwal}</p>}
                                        </div>
                                        <div>
                                            <Label htmlFor="extend_reason">Alasan Perpanjangan</Label>
                                            <Input id="extend_reason" name="extend_reason" required className="mt-1" />
                                            {errors.extend_reason && <p className="mt-1 text-sm text-red-500">{errors.extend_reason}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button disabled={processing} className="bg-linear-to-r from-[#0071b7] to-[#0093dd]">
                                            {processing ? 'Mengirim...' : 'Ajukan Extend'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                )}
            </div>
        </>
    );
}

WorkPlanningShow.layout = {
    breadcrumbs: [{ title: 'Work Planning', href: '/work-planning' }, { title: 'Detail', href: '' }],
};
