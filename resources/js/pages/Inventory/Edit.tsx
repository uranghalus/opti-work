import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index as inventoryIndex, update as inventoryUpdate } from '@/routes/inventory';

type KelompokOption = { id_kelompok_barang: number; kode_kelompok: string; nama_kelompok: string };
type ExpandField = { id_expand: number; field_name: string; field_value: string; field_type: string };

type Props = {
    inventory: {
        id_inventory: number;
        kode_barang: string;
        kode_inventory: string | null;
        nama_barang: string;
        id_kelompok_barang: number | null;
        spesifikasi: string | null;
        penanggung_jawab: string | null;
        kondisi: string;
        lokasi_barang: string | null;
        jenis_barang: string | null;
        expand_data: ExpandField[];
    };
    kelompokBarang: KelompokOption[];
};

export default function InventoryEdit({ inventory, kelompokBarang }: Props) {
    return (
        <>
            <Head title={`Edit: ${inventory.nama_barang}`} />
            <div className="mx-auto w-full max-w-3xl space-y-6">
                <Link href={inventoryIndex.url()} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#0071b7]">
                    <ArrowLeft className="size-4" /> Kembali ke Inventory
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-[#0071b7]">Edit Inventaris</h1>
                    <p className="text-sm text-neutral-500 font-mono text-xs">{inventory.kode_barang}</p>
                </div>

                <Form action={inventoryUpdate.url({ inventory: inventory.id_inventory })} method="post" className="space-y-6">
                    {({ errors }) => (
                        <>
                            <input type="hidden" name="_method" value="PUT" />
                            <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="kode_barang">Kode Barang *</Label>
                                        <Input id="kode_barang" name="kode_barang" required defaultValue={inventory.kode_barang} />
                                        {errors.kode_barang && <p className="text-xs text-red-500">{errors.kode_barang}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="kode_inventory">Kode Inventaris</Label>
                                        <Input id="kode_inventory" name="kode_inventory" defaultValue={inventory.kode_inventory ?? ''} />
                                        {errors.kode_inventory && <p className="text-xs text-red-500">{errors.kode_inventory}</p>}
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="nama_barang">Nama Barang *</Label>
                                        <Input id="nama_barang" name="nama_barang" required defaultValue={inventory.nama_barang} />
                                        {errors.nama_barang && <p className="text-xs text-red-500">{errors.nama_barang}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="id_kelompok_barang">Kelompok Barang</Label>
                                        <select id="id_kelompok_barang" name="id_kelompok_barang" defaultValue={inventory.id_kelompok_barang ?? ''} className="h-9 w-full rounded-lg border border-neutral-200 bg-background px-3 text-sm">
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
                                        <select id="kondisi" name="kondisi" required defaultValue={inventory.kondisi} className="h-9 w-full rounded-lg border border-neutral-200 bg-background px-3 text-sm">
                                            <option value="baik">Baik</option>
                                            <option value="rusak_ringan">Rusak Ringan</option>
                                            <option value="rusak_berat">Rusak Berat</option>
                                            <option value="perbaikan">Perbaikan</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="jenis_barang">Jenis Barang</Label>
                                        <Input id="jenis_barang" name="jenis_barang" defaultValue={inventory.jenis_barang ?? ''} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="penanggung_jawab">Penanggung Jawab</Label>
                                        <Input id="penanggung_jawab" name="penanggung_jawab" defaultValue={inventory.penanggung_jawab ?? ''} />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="lokasi_barang">Lokasi Barang</Label>
                                        <Input id="lokasi_barang" name="lokasi_barang" defaultValue={inventory.lokasi_barang ?? ''} />
                                    </div>
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="spesifikasi">Spesifikasi</Label>
                                        <Textarea id="spesifikasi" name="spesifikasi" rows={3} defaultValue={inventory.spesifikasi ?? ''} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div>
                                    <h2 className="font-semibold">Kolom Dinamis</h2>
                                    <p className="text-xs text-neutral-500">Kosongkan nama field untuk menghapus baris. Field yang dihapus dari daftar akan dihapus dari database.</p>
                                </div>
                                {(inventory.expand_data.length > 0 ? inventory.expand_data : [null]).map((field, i) => (
                                    <div key={field?.id_expand ?? `new-${i}`} className="grid items-end gap-2 sm:grid-cols-[2fr_2fr_1fr_auto]">
                                        <div className="space-y-1.5">
                                            <Label htmlFor={`df-name-${i}`}>Nama Field</Label>
                                            <Input id={`df-name-${i}`} name={`dynamic_fields[${i}][field_name]`} defaultValue={field?.field_name ?? ''} placeholder="misal: kapasitas" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor={`df-value-${i}`}>Nilai</Label>
                                            <Input id={`df-value-${i}`} name={`dynamic_fields[${i}][field_value]`} defaultValue={field?.field_value ?? ''} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor={`df-type-${i}`}>Tipe</Label>
                                            <select id={`df-type-${i}`} name={`dynamic_fields[${i}][field_type]`} defaultValue={field?.field_type ?? 'text'} className="h-9 w-full rounded-lg border border-neutral-200 bg-background px-2 text-sm">
                                                <option value="text">text</option>
                                                <option value="number">number</option>
                                                <option value="date">date</option>
                                                <option value="boolean">boolean</option>
                                            </select>
                                        </div>
                                        {field === null && <span />}
                                    </div>
                                ))}
                                <p className="text-xs text-neutral-400">Gunakan tombol browser "back" untuk menambah field baru setelah menyimpan, atau tambah dari halaman Create.</p>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={inventoryIndex.url()}>Batal</Link>
                                </Button>
                                <Button type="submit" className="bg-[#0071b7] hover:bg-[#005a92]">Simpan Perubahan</Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

InventoryEdit.layout = {
    breadcrumbs: [{ title: 'Inventory', href: '/inventory' }, { title: 'Edit', href: '#' }],
};
