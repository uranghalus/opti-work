import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { destroy as inventoryDestroy, edit as inventoryEdit, index as inventoryIndex } from '@/routes/inventory';

type ExpandField = { id_expand: number; field_name: string; field_value: string; field_type: string };

type Props = {
    inventory: {
        id_inventory: number;
        kode_barang: string;
        kode_inventory: string | null;
        nama_barang: string;
        kondisi: string;
        lokasi_barang: string | null;
        penanggung_jawab: string | null;
        spesifikasi: string | null;
        jenis_barang: string | null;
        kelompok_barang?: { nama_kelompok: string; kode_kelompok: string } | null;
        expand_data: ExpandField[];
    };
    workData: { id_work_data: number; no_kerja: string; status_pekerjaan: string | null }[];
};

export default function InventoryShow({ inventory, workData }: Props) {
    return (
        <>
            <Head title={inventory.nama_barang} />
            <div className="mx-auto w-full max-w-4xl space-y-6">
                <Link href={inventoryIndex.url()} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#0071b7]">
                    <ArrowLeft className="size-4" /> Kembali ke Inventory
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="font-mono text-xs font-semibold text-[#0071b7]">{inventory.kode_barang}{inventory.kode_inventory ? ` · ${inventory.kode_inventory}` : ''}</p>
                        <h1 className="text-2xl font-bold">{inventory.nama_barang}</h1>
                        <p className="text-sm text-neutral-500">{inventory.kelompok_barang ? `${inventory.kelompok_barang.kode_kelompok} · ${inventory.kelompok_barang.nama_kelompok}` : 'Tanpa kelompok'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={inventoryEdit.url({ inventory: inventory.id_inventory })}>
                                <Pencil className="size-4" /> Edit
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                            onClick={() =>
                                router.delete(inventoryDestroy.url({ inventory: inventory.id_inventory }), {
                                    onBefore: () => confirm('Hapus inventaris ini?'),
                                })
                            }
                        >
                            <Trash2 className="size-4" /> Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 font-semibold text-[#0071b7]">Detail Barang</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between gap-4"><Label className="text-neutral-500">Kondisi</Label><span className="capitalize">{inventory.kondisi.replace('_', ' ')}</span></div>
                            <div className="flex justify-between gap-4"><Label className="text-neutral-500">Jenis</Label><span>{inventory.jenis_barang ?? '—'}</span></div>
                            <div className="flex justify-between gap-4"><Label className="text-neutral-500">Lokasi</Label><span>{inventory.lokasi_barang ?? '—'}</span></div>
                            <div className="flex justify-between gap-4"><Label className="text-neutral-500">Penanggung Jawab</Label><span>{inventory.penanggung_jawab ?? '—'}</span></div>
                            <div className="border-t pt-3"><Label className="text-neutral-500">Spesifikasi</Label><p className="mt-1">{inventory.spesifikasi ?? '—'}</p></div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 font-semibold text-[#0071b7]">Kolom Dinamis (FR-24)</h2>
                        {inventory.expand_data.length === 0 && <p className="text-sm text-neutral-400">Tidak ada field tambahan.</p>}
                        <div className="space-y-2 text-sm">
                            {inventory.expand_data.map((f) => (
                                <div key={f.id_expand} className="flex justify-between gap-4 border-b border-dashed border-neutral-100 pb-2">
                                    <span className="text-neutral-500">{f.field_name}</span>
                                    <span className="font-medium">{f.field_value}</span>
                                </div>
                        ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-1 font-semibold text-[#0071b7]">Data Kerja Terkait (FR-18)</h2>
                    <p className="mb-4 text-xs text-neutral-500">Work Data yang menggunakan kode_inventory {inventory.kode_inventory ?? '—'}.</p>
                    {workData.length === 0 && <p className="text-sm text-neutral-400">Belum ada Work Data yang terhubung.</p>}
                    <div className="divide-y divide-neutral-100">
                        {workData.map((wd) => (
                            <Link key={wd.id_work_data} href={`/work-data/${wd.id_work_data}`} className="flex items-center justify-between py-2.5 text-sm hover:text-[#0071b7]">
                                <span className="font-mono text-xs font-semibold">{wd.no_kerja}</span>
                                <span className="flex items-center gap-2 text-neutral-500">
                                    {wd.status_pekerjaan ?? '—'} <ArrowRight className="size-3.5" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

InventoryShow.layout = {
    breadcrumbs: [{ title: 'Inventory', href: '/inventory' }, { title: 'Detail', href: '#' }],
};
