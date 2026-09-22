import { Form, Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { destroy as kelompokDestroy, index as kelompokIndex, store as kelompokStore, update as kelompokUpdate } from '@/routes/kelompok-barang';

type Kelompok = {
    id_kelompok_barang: number;
    kode_kelompok: string;
    nama_kelompok: string;
    deskripsi: string | null;
    inventories_count: number;
};

type PageProps = {
    kelompokBarang: {
        data: Kelompok[];
        links: { url: string | null; label: string; active: boolean }[];
        last_page: number;
    };
    filters: { search?: string };
};

export default function KelompokBarangIndex({ kelompokBarang, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Kelompok | null>(null);

    const openCreate = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (kb: Kelompok) => {
        setEditing(kb);
        setDialogOpen(true);
    };

    return (
        <>
            <Head title="Kelompok Barang" />
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0071b7]">Kelompok Barang</h1>
                        <p className="text-sm text-neutral-500">
                            Pengelompokan inventaris ·{' '}
                            <Link href="/inventory" className="text-[#0071b7] hover:underline">
                                kembali ke Inventory
                            </Link>
                        </p>
                    </div>
                    <Button onClick={openCreate} className="bg-[#0071b7] hover:bg-[#005a92]">
                        <Plus className="size-4" /> Tambah Kelompok
                    </Button>
                </div>

                <form action={kelompokIndex.url()} method="get" onSubmit={(e) => e.preventDefault()} className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                    <Input name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode atau nama kelompok..." className="pl-9" />
                </form>

                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-neutral-50 text-left text-xs text-neutral-500 uppercase">
                                <th className="px-4 py-3">Kode</th>
                                <th className="px-4 py-3">Nama Kelompok</th>
                                <th className="px-4 py-3">Deskripsi</th>
                                <th className="px-4 py-3 text-center">Jumlah Barang</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kelompokBarang.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-neutral-400">Belum ada kelompok barang.</td>
                                </tr>
                            )}
                            {kelompokBarang.data.map((kb) => (
                                <tr key={kb.id_kelompok_barang} className="border-b border-neutral-100 hover:bg-neutral-50/60">
                                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0071b7]">{kb.kode_kelompok}</td>
                                    <td className="px-4 py-3 font-medium">{kb.nama_kelompok}</td>
                                    <td className="px-4 py-3 text-neutral-600">{kb.deskripsi ?? '—'}</td>
                                    <td className="px-4 py-3 text-center">{kb.inventories_count}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(kb)} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-[#0071b7]">
                                                <Pencil className="size-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    router.delete(kelompokDestroy.url({ kelompok_barang: kb.id_kelompok_barang }), {
                                                        onBefore: () => confirm('Hapus kelompok ini?'),
                                                    })
                                                }
                                                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-red-600"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Kelompok' : 'Tambah Kelompok'}</DialogTitle>
                        <DialogDescription>Kelompok barang untuk mengelompokkan data inventaris.</DialogDescription>
                    </DialogHeader>
                    <Form
                        method="post"
                        action={editing ? kelompokUpdate.url({ kelompok_barang: editing.id_kelompok_barang }) : kelompokStore.url()}
                        options={{ preserveState: editing ? true : undefined }}
                        onSuccess={() => {
                            setDialogOpen(false);
                            setEditing(null);
                        }}
                        className="space-y-4"
                    >
                        {() => (
                            <>
                                {editing && <input type="hidden" name="_method" value="PUT" />}
                                <div className="space-y-1.5">
                                    <Label htmlFor="kode_kelompok">Kode Kelompok *</Label>
                                    <Input id="kode_kelompok" name="kode_kelompok" required defaultValue={editing?.kode_kelompok ?? ''} placeholder="KB-XX" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="nama_kelompok">Nama Kelompok *</Label>
                                    <Input id="nama_kelompok" name="nama_kelompok" required defaultValue={editing?.nama_kelompok ?? ''} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="deskripsi">Deskripsi</Label>
                                    <Input id="deskripsi" name="deskripsi" defaultValue={editing?.deskripsi ?? ''} />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
                                    <Button type="submit" className="bg-[#0071b7] hover:bg-[#005a92]">Simpan</Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

KelompokBarangIndex.layout = {
    breadcrumbs: [{ title: 'Inventory', href: '/inventory' }, { title: 'Kelompok Barang', href: '/kelompok-barang' }],
};
