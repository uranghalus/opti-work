import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Clock } from 'lucide-react';

type PageProps = {
    workOrder: {
        id_work_order: number;
        no_work_order: string;
        rincian_pekerjaan: string;
        deadline_date: string | null;
        status_pekerjaan: string;
        extend_count: number;
    };
};

export default function ExtendRequest() {
    const { workOrder } = usePage<PageProps>().props;
    const [extendDays, setExtendDays] = useState(1);

    const { data, setData, post, processing, errors, reset } = useForm({
        extend_days: 1,
        extend_reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/work-orders/${workOrder.id_work_order}/extend`, {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title={`Extend WO ${workOrder.no_work_order}`} />

            <div className="max-w-2xl mx-auto space-y-6">
                <Heading
                    variant="small"
                    title={`Extend Work Order: ${workOrder.no_work_order}`}
                    description="Request additional time to complete this work order (max 3 days)"
                />

                {/* Current deadline info */}
                {workOrder.deadline_date && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-center gap-2 text-primary">
                            <Clock className="size-5" />
                            <span className="font-medium">Current Deadline:</span>
                            <span>{new Date(workOrder.deadline_date).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}</span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Extends used: {workOrder.extend_count} / 2
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                        <div className="rounded-[calc(0.75rem-4px)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                            <h3 className="text-sm font-semibold text-foreground mb-4">Extend Request Details</h3>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="extend_days" className="text-sm font-medium">
                                        Additional Days (max 3)
                                    </Label>
                                    <Input
                                        id="extend_days"
                                        type="number"
                                        min={1}
                                        max={3}
                                        value={extendDays}
                                        onChange={(e) => {
                                            const val = Math.max(1, Math.min(3, parseInt(e.target.value) || 1));
                                            setExtendDays(val);
                                            setData('extend_days', val);
                                        }}
                                        className="rounded-xl border-border/40 bg-background mt-1.5"
                                    />
                                    <InputError message={errors.extend_days} className="mt-1" />
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Work Order Status</Label>
                                    <Input
                                        value={workOrder.status_pekerjaan}
                                        readOnly
                                        className="rounded-xl border-border/40 bg-muted mt-1.5"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label htmlFor="extend_reason" className="text-sm font-medium">
                                    Reason for Extension <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="extend_reason"
                                    value={data.extend_reason}
                                    onChange={(e) => setData('extend_reason', e.target.value)}
                                    placeholder="Explain why additional time is needed..."
                                    rows={4}
                                    className="rounded-xl border-border/40 bg-background mt-1.5"
                                />
                                <InputError message={errors.extend_reason} className="mt-1" />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Minimum 10 characters. Be specific about the cause of delay.
                                </p>
                            </div>

                            <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                                <AlertTriangle className="size-4 text-destructive" />
                                <p className="text-sm text-destructive/90">
                                    Max 3 days per request. Total extends limited to 2 per work order.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Submitting...' : 'Submit Extend Request'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}