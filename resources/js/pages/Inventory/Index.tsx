import { Head, Link } from '@inertiajs/react';
import { Eye, Filter, Pencil, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { index as inventoryIndex, create as inventoryCreate, show as inventoryShow, edit as inventoryEdit } from '@/routes/inventory';

type Inventory = {
    id_inventory: number;
    kode_barang: string;
    kode_inventory: string | null;
    nama_barang: string;
    kondisi: string;
    lokasi_barang: string | null;
    penanggung_jawab: string | null;
    jenis_barang: string | null;
    kelompok_barang?: { nama_kelompok: string } | null;
};

type Filters = { search?: string; kondisi?: string; jenis?: string };

type PageProps = {
    inventories: {
        data: Inventory[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: Filters;
};

const kondisiVariant: Record<string, string> = {
    baik: 'bg-emerald-100 text-emerald-700',
    rusak_ringan: 'bg-amber-100 text-amber-700',
    rusak_berat: 'bg-red-100 text-red-700',
    perbaikan: 'bg-blue-100 text-blue-700',
};

export default function InventoryIndex({ inventories, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    return (
        <>
            <Head title="Inventory" />
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0071b7]">Inventory</h1>
                        <p className="text-sm text-neutral-500">Manajemen data inventaris ({inventories.total} barang)</p>
                    </div>
                    <Button asChild className="bg-[#0071b7] hover:bg-[#005a92]">
                        <Link href={inventoryCreate.url()}>
                            <Plus className="size-4" /> Tambah Barang
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="relative min-w-[220px] flex-1"
                        action={inventoryIndex.url()}
                        method="get"
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                        <Input
                            name="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode barang, nama, lokasi, PJ..."
                            className="pl-9"
                        />
                    </form>
                    <select
                        defaultValue={filters.kondisi ?? ''}
                        onChange={(e) => (window.location.href = `${inventoryIndex.url()}?kondisi=${e.target.value}`)}
                        className="h-9 rounded-lg border border-neutral-200 bg-background px-3 text-sm"
                    >
                        <option value="">Semua kondisi</option>
                        <option value="baik">Baik</option>
                        <option value="rusak_ringan">Rusak Ringan</option>
                        <option value="rusak_berat">Rusak Berat</option>
                        <option value="perbaikan">Perbaikan</option>
                    </select>
                    {filters.kondisi && (
                        <Link href={inventoryIndex.url()} className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-[#0071b7]">
                            <X className="size-3" /> Hapus filter <Filter className="size-3" />
                        </Link>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-neutral-50 text-left text-xs text-neutral-500 uppercase">
                                <th className="px-4 py-3">Kode Barang</th>
                                <th className="px-4 py-3">Nama Barang</th>
                                <th className="px-4 py-3">Kelompok</th>
                                <th className="px-4 py-3">Kondisi</th>
                                <th className="px-4 py-3">Lokasi</th>
                                <th className="px-4 py-3">PJ</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventories.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-10 text-center text-neutral-400">
                                        Belum ada data inventaris.
                                    </td>
                                </tr>
                            )}
                            {inventories.data.map((item) => (
                                <tr key={item.id_inventory} className="border-b border-neutral-100 hover:bg-neutral-50/60">
                                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0071b7]">{item.kode_barang}</td>
                                    <td className="px-4 py-3 font-medium">{item.nama_barang}</td>
                                    <td className="px-4 py-3 text-neutral-600">{item.kelompok_barang?.nama_kelompok ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${kondisiVariant[item.kondisi] ?? 'bg-neutral-100 text-neutral-600'}`}>
                                            {item.kondisi.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-600">{item.lokasi_barang ?? '—'}</td>
                                    <td className="px-4 py-3 text-neutral-600">{item.penanggung_jawab ?? '—'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={inventoryShow.url(item.id_inventory)} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-[#0071b7]">
                                                <Eye className="size-4" />
                                            </Link>
                                            <Link href={inventoryEdit.url(item.id_inventory)} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-[#0071b7]">
                                                <Pencil className="size-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {inventories.last_page > 1 && (
                    <div className="flex flex-wrap gap-1">
                        {inventories.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`rounded-lg px-3 py-1.5 text-sm ${link.active ? 'bg-[#0071b7] text-white' : 'text-neutral-600 hover:bg-neutral-100'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

InventoryIndex.layout = {
    breadcrumbs: [{ title: 'Inventory', href: '/inventory' }],
};
