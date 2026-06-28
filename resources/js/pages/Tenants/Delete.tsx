import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Tenant = {
    id: number;
    name: string;
    company_name?: string | null;
};

type TenantDeleteModalProps = {
    open: boolean;
    onClose: () => void;
    tenant: Tenant | null;
};

export default function TenantDeleteModal({ open, onClose, tenant }: TenantDeleteModalProps) {
    const [processing, setProcessing] = useState(false);

    const handleDelete = () => {
        if (!tenant) {
            return;
        }

        setProcessing(true);
        router.delete(`/tenants/${tenant.id}`, {
            onSuccess: () => {
                toast.success('Tenant berhasil dihapus.');
                onClose();
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete Tenant</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-neutral-900 dark:text-white">
                            {tenant?.name}
                        </span>
                        ? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={processing}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={processing}
                        onClick={handleDelete}
                    >
                        {processing ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
