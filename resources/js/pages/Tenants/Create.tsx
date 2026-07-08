import { useForm } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { store } from '@/routes/tenants';

type CreateProps = { open: boolean; onClose: () => void };

export default function TenantCreateModal({ open, onClose }: CreateProps) {
    const form = useForm({ name: '', company_name: '', status: 'active' as 'active' | 'inactive' | 'suspended', type: '', email: '', phone: '', area: '', location: '', logo: null as File | null, description: '' });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
 form.setData('logo', file); const r = new FileReader(); r.onload = () => setLogoPreview(r.result as string); r.readAsDataURL(file); 
}
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(store.url(), { onSuccess: () => {
 toast.success('Tenant berhasil ditambahkan.'); form.reset(); setLogoPreview(null); onClose(); 
} });
    };

    const cancel = () => {
 form.reset(); form.clearErrors(); setLogoPreview(null); onClose(); 
};

    return (
        <Dialog open={open} onOpenChange={cancel}>
            <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 flex flex-col overflow-hidden gap-0">
                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background flex flex-col overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Upload className="size-5" /></div>
                            <div>
                                <DialogTitle className="text-lg font-semibold text-foreground">Add New Tenant</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">Fill in the details to register a new tenant, partner, or vendor.</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <form onSubmit={submit} className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {/* Logo */}
                            <div className="grid gap-2">
                                <Label className="text-sm font-medium">Logo</Label>
                                <div className="flex items-center gap-6">
                                    <div onClick={() => fileRef.current?.click()} className="flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border/50 bg-accent/30 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-primary/50 hover:bg-primary/5">
                                        {logoPreview ? <img src={logoPreview} alt="Logo preview" className="size-full object-cover" /> : (
                                            <div className="flex flex-col items-center gap-1 text-muted-foreground/50"><Upload className="size-5" /><span className="text-[10px]">Upload</span></div>
                                        )}
                                    </div>
                                    <div>
                                        <input ref={fileRef} type="file" name="logo" accept="image/*" onChange={handleLogo} className="hidden" />
                                        <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="rounded-full px-4">Choose File</Button>
                                        <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG, SVG or WebP. Max 2MB.</p>
                                        {form.errors.logo && <p className="mt-1 text-xs text-destructive">{form.errors.logo}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                                    <div className="size-1.5 rounded-full bg-primary" />
                                    <h3 className="text-sm font-semibold text-foreground">Main Information</h3>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {[
                                        { id: 'create-name', label: 'Name', required: true, placeholder: 'Contact person name', key: 'name' as const },
                                        { id: 'create-company_name', label: 'Company Name', placeholder: 'Company or business name', key: 'company_name' as const },
                                        { id: 'create-status', label: 'Status', required: true, key: 'status' as const, type: 'select', options: ['active', 'inactive', 'suspended'] },
                                        { id: 'create-type', label: 'Type', placeholder: 'e.g. Internal, External, Vendor', key: 'type' as const },
                                    ].map((field) => (
                                        <div key={field.id} className="grid gap-2">
                                            <Label htmlFor={field.id}>{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
                                            {'type' in field && field.type === 'select' ? (
                                                <Select name={field.key} value={form.data[field.key] as string} onValueChange={(v: any) => form.setData(field.key, v)}>
                                                    <SelectTrigger id={field.id}><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                                                    <SelectContent>{(field.options || []).map((o) => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
                                                </Select>
                                            ) : (
                                                <div className="rounded-xl border border-border/40 bg-black/[0.015] p-1 dark:bg-white/[0.015]">
                                                    <Input id={field.id} name={field.key} value={form.data[field.key] as string} onChange={(e) => form.setData(field.key, e.target.value)} placeholder={field.placeholder} className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]" />
                                                </div>
                                            )}
                                            {form.errors[field.key] && <p className="text-xs text-destructive">{form.errors[field.key]}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact & Location */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                                    <div className="size-1.5 rounded-full bg-primary" />
                                    <h3 className="text-sm font-semibold text-foreground">Contact &amp; Location</h3>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {[
                                        { id: 'create-email', label: 'Email', placeholder: 'email@example.com', key: 'email' as const, type: 'email' },
                                        { id: 'create-phone', label: 'Phone', placeholder: '+62 812 3456 7890', key: 'phone' as const },
                                        { id: 'create-area', label: 'Area', placeholder: 'Operational zone or region', key: 'area' as const },
                                        { id: 'create-location', label: 'Location', placeholder: 'Full address', key: 'location' as const },
                                    ].map((field) => (
                                        <div key={field.id} className="grid gap-2">
                                            <Label htmlFor={field.id}>{field.label}</Label>
                                            <div className="rounded-xl border border-border/40 bg-black/[0.015] p-1 dark:bg-white/[0.015]">
                                                <Input id={field.id} name={field.key} type={field.type || 'text'} value={form.data[field.key] as string} onChange={(e) => form.setData(field.key, e.target.value)} placeholder={field.placeholder} className="rounded-[calc(0.75rem-4px)] border-0 bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]" />
                                            </div>
                                            {form.errors[field.key] && <p className="text-xs text-destructive">{form.errors[field.key]}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                                    <div className="size-1.5 rounded-full bg-primary" />
                                    <h3 className="text-sm font-semibold text-foreground">Description</h3>
                                </div>
                                <div className="rounded-xl border border-border/40 bg-black/[0.015] p-1 dark:bg-white/[0.015]">
                                    <textarea id="create-description" name="description" rows={4} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)}
                                        className="flex w-full rounded-[calc(0.75rem-4px)] border-0 bg-background px-3 py-2 text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] placeholder:text-muted-foreground/50 focus-visible:outline-none resize-none"
                                        placeholder="Additional notes about this tenant..." />
                                </div>
                                {form.errors.description && <p className="text-xs text-destructive">{form.errors.description}</p>}
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-4 border-t bg-accent/20 shrink-0">
                            <Button type="button" variant="outline" onClick={cancel} className="rounded-full px-6">Cancel</Button>
                            <Button disabled={form.processing} type="submit" className="group rounded-full bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]">
                                {form.processing ? 'Saving...' : 'Save Tenant'}
                                <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5"><Upload className="size-3" /></span>
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
