import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index as inventoryIndex, store as inventoryStore } from '@/routes/inventory';

type KelompokOption = {
    id_kelompok_barang: number;
    kode_kelompok: string;
    nama_kelompok: string;
};

type DynamicField = { field_name: string; field_value: string; field_type: string };

type Props = { kelompokBarang: KelompokOption[] };

export default function InventoryCreate({ kelompokBarang }: Props) {
    const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);

    const addField = () => setDynamicFields((prev) => [...prev, { field_name: '', field_value: '', field_type: 'text' }]);
    const removeField = (i: number) => setDynamicFields((prev) => prev.filter((_, idx) => idx !== i));
    const updateField = (i: number, patch: Partial<DynamicField>) =>
        setDynamicFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

    return (
        <>
            <Head title="Tambah Inventaris" />
            <div className="mx-auto w-full max-w-3xl space-y-6">
                <Link href={inventoryIndex.url()} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#0071b7]">
                    <ArrowLeft className="size-4" /> Kembali ke Inventory
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-[#0071b7]">Tambah Inventaris</h1>
                    <p className="text-sm text-neutral-500">Lengkapi data barang beserta kolom dinamis per jenis barang (FR-24).</p>
                </div>

                <Form action={inventoryStore.url()} method="post" className="space-y-6">
                    {({ errors }) => (
                        <>
                            <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="kode_barang">Kode Barang *</Label>
                                        <Input id="kode_barang" name="kode_barang" required placeholder="BRG-XXXX" />
                                        {errors.kode_barang && <p className="text-xs text-red-500">{errors.kode_barang}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="kode_inventory">Kode Inventaris (untuk link Work Data)</Label>
                                        <Input id="kode_inventory" name="kode_inventory" placeholder="INV-0001" />
                                        {errors.kode_inventory && <p className="text-xs text-red-500">{errors.kode_inventory}</p>}
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="nama_barang">Nama Barang *</Label>
                                        <Input id="nama_barang" name="nama_barang" required />
                                        {errors.nama_barang && <p className="text-xs text-red-500">{errors.nama_barang}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="id_kelompok_barang">Kelompok Barang</Label>
                                        <select id="id_kelompok_barang" name="id_kelompok_barang" className="h-9 w-full rounded-lg border border-neutral-200 bg-background px-3 text-sm">
                                            <option value="">— Pilih kelompok —</option>
                                            {kelompokBarang.map((kb) => (
                                                <option key={kb.id_kelompok_barang} value={kb.id_kelompok_barang}>
                                                    {kb.kode_kelompok} · {kb.nama_kelompok}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="kondisi">Kondisi *</Label>
                                        <select id="kondisi" name="kondisi" required defaultValue="baik" className="h-9 w-full rounded-lg border border-neutral-200 bg-background px-3 text-sm">
                                            <option value="baik">Baik</option>
                                            <option value="rusak_ringan">Rusak Ringan</option>
                                            <option value="rusak_berat">Rusak Berat</option>
                                            <option value="perbaikan">Perbaikan</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="jenis_barang">Jenis Barang</Label>
                                        <Input id="jenis_barang" name="jenis_barang" placeholder="mekanikal / elektrikal / ..." />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="penanggung_jawab">Penanggung Jawab</Label>
                                        <Input id="penanggung_jawab" name="penanggung_jawab" />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="lokasi_barang">Lokasi Barang</Label>
                                        <Input id="lokasi_barang" name="lokasi_barang" placeholder="Gedung A Lt 2" />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="spesifikasi">Spesifikasi</Label>
                                        <Textarea id="spesifikasi" name="spesifikasi" rows={3} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="font-semibold">Kolom Dinamis</h2>
                                        <p className="text-xs text-neutral-500">Field tambahan yang dikonfigurasi per jenis barang (FR-24).</p>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addField}>
                                        <Plus className="size-4" /> Tambah Field
                                    </Button>
                                </div>
                                {dynamicFields.length === 0 && <p className="text-sm text-neutral-400">Belum ada field tambahan.</p>}
                                {dynamicFields.map((field, i) => (
                                    <div key={i} className="grid items-end gap-2 sm:grid-cols-[2fr_2fr_1fr_auto]">
                                        <div className="space-y-1.5">
                                            <Label htmlFor={`df-name-${i}`}>Nama Field</Label>
                                            <Input
                                                id={`df-name-${i}`}
                                                value={field.field_name}
                                                onChange={(e) => updateField(i, { field_name: e.target.value })}
                                                placeholder="misal: kapasitas"
                                                name={`dynamic_fields[${i}][field_name]`}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor={`df-value-${i}`}>Nilai</Label>
                                            <Input
                                                id={`df-value-${i}`}
                                                value={field.field_value}
                                                onChange={(e) => updateField(i, { field_value: e.target.value })}
                                                name={`dynamic_fields[${i}][field_value]`}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor={`df-type-${i}`}>Tipe</Label>
                                            <select
                                                id={`df-type-${i}`}
                                                value={field.field_type}
                                                onChange={(e) => updateField(i, { field_type: e.target.value })}
                                                className="h-9 w-full rounded-lg border border-neutral-200 bg-background px-2 text-sm"
                                                name={`dynamic_fields[${i}][field_type]`}
                                            >
                                                <option value="text">text</option>
                                                <option value="number">number</option>
                                                <option value="date">date</option>
                                                <option value="boolean">boolean</option>
                                            </select>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeField(i)} className="text-red-500 hover:text-red-600">
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={inventoryIndex.url()}>Batal</Link>
                                </Button>
                                <Button type="submit" className="bg-[#0071b7] hover:bg-[#005a92]">Simpan</Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

InventoryCreate.layout = {
    breadcrumbs: [{ title: 'Inventory', href: '/inventory' }, { title: 'Tambah', href: '/inventory/create' }],
};
