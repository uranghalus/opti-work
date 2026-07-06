import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';

type Tenant = { id: number; name: string; company_name?: string | null };
type Props = { open: boolean; onClose: () => void; tenant: Tenant | null };

export default function TenantDeleteModal({ open, onClose, tenant }: Props) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!tenant) {
return;
}

        setProcessing(true);
        router.delete(`/tenants/${tenant.id}`, {
            onSuccess: () => {
 toast.success('Tenant berhasil dihapus.'); onClose(); 
},
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md">
                <div className="rounded-[calc(1.5rem-0.375rem)] bg-background">
                    <div className="flex flex-col items-center text-center px-6 pt-8 pb-4">
                        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 mb-4">
                            <AlertTriangle className="size-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-lg font-semibold text-foreground">Delete Tenant</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-2 max-w-sm">
                            Are you sure you want to delete <span className="font-semibold text-foreground">{tenant?.name}</span>? This action cannot be undone.
                        </DialogDescription>
                    </div>
                    <DialogFooter className="px-6 pb-6 pt-2 gap-2 sm:gap-0 flex-row justify-center">
                        <Button type="button" variant="outline" disabled={processing} onClick={onClose} className="rounded-full px-6">Cancel</Button>
                        <Button type="button" variant="destructive" disabled={processing} onClick={handleDelete} className="rounded-full px-6 shadow-lg shadow-destructive/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]">
                            {processing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
