import { Head, router } from '@inertiajs/react';
import { CalendarDays, ListChecks, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index as dailyIndex, create as dailyCreate, updateStatus as dailyUpdateStatus, destroy as dailyDestroy } from '@/routes/work-daily';

type WorkDaily = {
    id_work_daily: number;
    tanggal_kerja: string;
    aktivitas_hari_ini: string;
    progres_persentase: number;
    kendala_lapangan: string | null;
    pelapor: string | null;
    status_pekerjaan: string;
    prioritas: string;
    level: string;
    work_data?: { id_work_data: number; no_kerja: string; status_pekerjaan: string } | null;
    employee?: { id_employee: string; nik_employee: string; nama_employee: string } | null;
};

type PaginatedList<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    workDailies: PaginatedList<WorkDaily>;
    filters: { status_pekerjaan?: string; tanggal_kerja?: string };
};

const statusColors: Record<string, string> = {
    open: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    on_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
    selesai: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
};

const prioritasColors: Record<string, string> = {
    low: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    high: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

const pretty = (value: string) => value.replace(/_/g, ' ');

export default function WorkDailyIndex({ workDailies, filters }: Props) {
    const [editing, setEditing] = useState<WorkDaily | null>(null);
    const [form, setForm] = useState({ status_pekerjaan: 'on_progress', aktivitas_hari_ini: '', progres_persentase: 0, kendala_lapangan: '' });

    const openEdit = (workDaily: WorkDaily) => {
        setEditing(workDaily);
        setForm({
            status_pekerjaan: workDaily.status_pekerjaan,
            aktivitas_hari_ini: workDaily.aktivitas_hari_ini,
            progres_persentase: workDaily.progres_persentase,
            kendala_lapangan: workDaily.kendala_lapangan ?? '',
        });
    };

    const submitStatus = () => {
        if (!editing) {
            return;
        }

        router.patch(dailyUpdateStatus.url({ work_daily: editing.id_work_daily }), form, {
            onSuccess: () => setEditing(null),
        });
    };

    return (
        <>
            <Head title="Work Daily" />

            <div className="mx-auto w-full max-w-7xl space-y-6">
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#0071b7] via-[#0089cc] to-[#0093dd] p-8 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="mb-2 text-sm text-white/80">Daily Work Management</p>
                            <h1 className="text-3xl font-bold text-white">Pekerjaan Harian</h1>
                        </div>
                        <a href={dailyCreate.url()}>
                            <Button className="bg-white text-[#0071b7] hover:bg-white/90">
                                <Plus className="size-4" /> Tetapkan Pekerjaan
                            </Button>
                        </a>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <select
                        value={filters.status_pekerjaan || ''}
                        onChange={(e) =>
                            router.get(dailyIndex.url(), { status_pekerjaan: e.target.value || undefined }, { preserveState: true })
                        }
                        className="rounded-lg border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    >
                        <option value="">Semua Status</option>
                        <option value="open">open</option>
                        <option value="on_progress">on progress</option>
                        <option value="selesai">selesai</option>
                    </select>
                    <div>
                        <Label className="text-xs">Tanggal</Label>
                        <Input
                            type="date"
                            className="mt-1 w-44"
                            defaultValue={filters.tanggal_kerja || ''}
                            onChange={(e) =>
                                router.get(dailyIndex.url(), { tanggal_kerja: e.target.value || undefined }, { preserveState: true })
                            }
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b dark:border-neutral-700">
                                <th className="p-3">Tanggal</th>
                                <th className="p-3">Karyawan</th>
                                <th className="p-3">SPK</th>
                                <th className="p-3">Aktivitas</th>
                                <th className="p-3">Progres</th>
                                <th className="p-3">Prioritas</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workDailies.data.map((workDaily) => (
                                <tr key={workDaily.id_work_daily} className="border-b last:border-0 dark:border-neutral-800">
                                    <td className="p-3 dark:text-white">{workDaily.tanggal_kerja}</td>
                                    <td className="p-3 text-neutral-600 dark:text-neutral-300">{workDaily.employee?.nama_employee ?? workDaily.pelapor ?? '-'}</td>
                                    <td className="p-3 text-neutral-600 dark:text-neutral-300">{workDaily.work_data?.no_kerja ?? '-'}</td>
                                    <td className="max-w-[280px] truncate p-3 text-neutral-600 dark:text-neutral-300">{workDaily.aktivitas_hari_ini}</td>
                                    <td className="p-3 dark:text-white">{workDaily.progres_persentase}%</td>
                                    <td className="p-3">
                                        <Badge className={`capitalize ${prioritasColors[workDaily.prioritas] || ''}`}>{pretty(workDaily.prioritas)}</Badge>
                                    </td>
                                    <td className="p-3">
                                        <Badge className={`capitalize ${statusColors[workDaily.status_pekerjaan] || ''}`}>{pretty(workDaily.status_pekerjaan)}</Badge>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(workDaily)}>
                                                <ListChecks className="size-4" /> Update
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => window.confirm('Hapus pekerjaan harian ini?') && router.delete(dailyDestroy.url({ work_daily: workDaily.id_work_daily }))}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {workDailies.data.length === 0 && <p className="py-8 text-center text-neutral-500">Belum ada pekerjaan harian.</p>}

                    {workDailies.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-center gap-1">
                            {workDailies.links.map((link, index) => (
                                <a
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

            <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Pekerjaan Harian</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="status_pekerjaan">Status</Label>
                            <select
                                id="status_pekerjaan"
                                value={form.status_pekerjaan}
                                onChange={(e) => setForm({ ...form, status_pekerjaan: e.target.value })}
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                                <option value="open">open</option>
                                <option value="on_progress">on progress</option>
                                <option value="selesai">selesai</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="aktivitas">Aktivitas Hari Ini</Label>
                            <Textarea
                                id="aktivitas"
                                rows={3}
                                className="mt-1"
                                value={form.aktivitas_hari_ini}
                                onChange={(e) => setForm({ ...form, aktivitas_hari_ini: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="progres">Progres (%)</Label>
                            <Input
                                id="progres"
                                type="number"
                                min={0}
                                max={100}
                                className="mt-1"
                                value={form.progres_persentase}
                                onChange={(e) => setForm({ ...form, progres_persentase: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="kendala">Kendala Lapangan</Label>
                            <Textarea
                                id="kendala"
                                rows={2}
                                className="mt-1"
                                value={form.kendala_lapangan}
                                onChange={(e) => setForm({ ...form, kendala_lapangan: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditing(null)}>
                            Batal
                        </Button>
                        <Button className="bg-linear-to-r from-[#0071b7] to-[#0093dd]" onClick={submitStatus}>
                            <CalendarDays className="size-4" /> Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

WorkDailyIndex.layout = {
    breadcrumbs: [{ title: 'Work Daily', href: '/work-daily' }],
};
