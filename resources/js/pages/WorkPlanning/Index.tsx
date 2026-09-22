import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock, Edit, Eye, Plus, Trash2, Undo2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    index as planningIndex,
    create as planningCreate,
    show as planningShow,
    edit as planningEdit,
    destroy as planningDestroy,
} from '@/routes/work-planning';

type WorkOrderSummary = {
    id_work_order: number;
    no_work_order: string;
    rincian_pekerjaan: string;
    department_tujuan: string | null;
    lokasi: string | null;
    prioritas: string;
    priority_type: string;
    status_pekerjaan: string | null;
};

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
    extend_count: number;
    extend_reason: string | null;
    work_order?: WorkOrderSummary;
};

type PaginatedList<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    plannings: PaginatedList<WorkPlanning>;
    summary: { total: number; planned: number; in_progress: number; completed: number };
    filters: { status_jadwal?: string; search?: string };
};

const statuses = ['planned', 'scheduled', 'in_progress', 'pending_extend_approval', 'rescheduled', 'completed', 'cancelled'];

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

export default function WorkPlanningIndex({ plannings, summary, filters }: Props) {
    const summaryCards = [
        { label: 'Total Jadwal', value: summary.total, icon: CalendarDays },
        { label: 'Planned', value: summary.planned, icon: Clock },
        { label: 'In Progress', value: summary.in_progress, icon: Undo2 },
        { label: 'Completed', value: summary.completed, icon: CheckCircle2 },
    ];

    return (
        <>
            <Head title="Work Planning" />

            <div className="mx-auto w-full max-w-7xl space-y-6">
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#0071b7] via-[#0089cc] to-[#0093dd] p-8 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="mb-2 text-sm text-white/80">Work Order Terjadwal (Work Planning)</p>
                            <h1 className="text-3xl font-bold text-white">Work Planning</h1>
                        </div>
                        <Link href={planningCreate.url()}>
                            <Button className="bg-white text-[#0071b7] hover:bg-white/90">
                                <Plus className="size-4" /> Buat Jadwal
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {summaryCards.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
                                <Icon className="size-4 text-[#0071b7]" />
                            </div>
                            <p className="mt-2 text-2xl font-bold dark:text-white">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <select
                        value={filters.status_jadwal || ''}
                        onChange={(e) =>
                            router.get(planningIndex.url(), { status_jadwal: e.target.value || undefined, search: filters.search || undefined }, { preserveState: true })
                        }
                        className="rounded-lg border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    >
                        <option value="">Semua Status</option>
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {pretty(status)}
                            </option>
                        ))}
                    </select>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const form = new FormData(e.currentTarget);
                            router.get(planningIndex.url(), { search: form.get('search') || undefined, status_jadwal: filters.status_jadwal || undefined }, { preserveState: true });
                        }}
                        className="flex flex-1 gap-2"
                    >
                        <Input name="search" defaultValue={filters.search || ''} placeholder="Cari no WO / rincian / department..." className="max-w-xs" />
                        <Button type="submit" variant="outline">
                            Cari
                        </Button>
                    </form>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b dark:border-neutral-700">
                                <th className="p-3">No WO</th>
                                <th className="p-3">Rincian</th>
                                <th className="p-3">Department</th>
                                <th className="p-3">Tanggal</th>
                                <th className="p-3">Durasi</th>
                                <th className="p-3">Budget</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plannings.data.map((planning) => (
                                <tr key={planning.id} className="border-b last:border-0 dark:border-neutral-800">
                                    <td className="p-3 font-medium dark:text-white">{planning.work_order?.no_work_order ?? '-'}</td>
                                    <td className="max-w-[240px] truncate p-3 text-neutral-600 dark:text-neutral-300">{planning.work_order?.rincian_pekerjaan ?? '-'}</td>
                                    <td className="p-3 text-neutral-600 dark:text-neutral-300">{planning.work_order?.department_tujuan ?? '-'}</td>
                                    <td className="p-3 dark:text-white">{planning.tgl_jadwal}</td>
                                    <td className="p-3 text-neutral-600 dark:text-neutral-300">{planning.lama_pekerjaan_hari ? `${planning.lama_pekerjaan_hari} hari` : '-'}</td>
                                    <td className="p-3 text-neutral-600 dark:text-neutral-300">{planning.budget ? `Rp ${Number(planning.budget).toLocaleString('id-ID')}` : '-'}</td>
                                    <td className="p-3">
                                        <Badge className={`capitalize ${statusColors[planning.status_jadwal] || ''}`}>{pretty(planning.status_jadwal)}</Badge>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-2">
                                            <Link href={planningShow.url({ work_planning: planning.id })}>
                                                <Button size="sm" variant="outline">
                                                    <Eye className="size-4" />
                                                </Button>
                                            </Link>
                                            <Link href={planningEdit.url({ work_planning: planning.id })}>
                                                <Button size="sm" variant="outline">
                                                    <Edit className="size-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => window.confirm('Hapus work planning ini?') && router.delete(planningDestroy.url({ work_planning: planning.id }))}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {plannings.data.length === 0 && <p className="py-8 text-center text-neutral-500">Belum ada work planning.</p>}

                    {plannings.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-1">
                            {plannings.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url ?? '#'}
                                    className={`rounded-lg px-3 py-1.5 text-sm ${
                                        link.active ? 'bg-[#0071b7] text-white' : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

WorkPlanningIndex.layout = {
    breadcrumbs: [{ title: 'Work Planning', href: '/work-planning' }],
};
