import { Head, router, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

type ExtendRequest = {
    id_extend_request: number;
    extend_days: number;
    extend_reason: string;
    status: string;
    created_at: string;
    work_order: { id_work_order: number; no_work_order: string; rincian_pekerjaan: string; department_tujuan: string };
    requester: { id: number; name: string };
    tl_approved_at: string | null;
    hod_approved_at: string | null;
};

type PageProps = {
    extendRequests: ExtendRequest[];
};

export default function ExtendApproval() {
    const { extendRequests } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Extend Approvals" />

            <div className="space-y-6">
                <Heading variant="small" title="Pending Extend Requests" description="Review and approve/reject work order extension requests" />

                {extendRequests.length === 0 ? (
                    <div className="rounded-xl border border-border/40 bg-black/[0.02] p-8 text-center dark:bg-white/[0.02]">
                        <Clock className="mx-auto size-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">No pending extend requests</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {extendRequests.map((req) => (
                            <ExtendRequestCard key={req.id_extend_request} request={req} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function ExtendRequestCard({ request }: { request: ExtendRequest }) {
    const [rejectNotes, setRejectNotes] = useState('');
    const [showReject, setShowReject] = useState(false);

    const needsTlApproval = request.status === 'pending_tl_approval';
    const needsHodApproval = request.status === 'pending_hod_approval';

    return (
        <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
            <div className="rounded-[calc(0.75rem-4px)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">{request.work_order.no_work_order}</h3>
                        <p className="text-xs text-muted-foreground">{request.work_order.department_tujuan}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        needsTlApproval ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                        {needsTlApproval ? 'Pending TL' : 'Pending HOD'}
                    </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">{request.work_order.rincian_pekerjaan}</p>

                <div className="mt-3 grid grid-cols-3 gap-4 text-xs">
                    <div>
                        <span className="text-muted-foreground">Requested by</span>
                        <p className="font-medium">{request.requester.name}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Extra days</span>
                        <p className="font-medium">+{request.extend_days} day{request.extend_days > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Date</span>
                        <p className="font-medium">{new Date(request.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                </div>

                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Reason:</p>
                    <p className="text-sm">{request.extend_reason}</p>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    {showReject ? (
                        <div className="flex w-full items-end gap-2">
                            <div className="flex-1">
                                <Label className="text-xs">Rejection notes</Label>
                                <Textarea
                                    value={rejectNotes}
                                    onChange={(e) => setRejectNotes(e.target.value)}
                                    placeholder="Optional rejection reason..."
                                    rows={2}
                                    className="mt-1 rounded-xl border-border/40 bg-background text-sm"
                                />
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    const url = needsTlApproval
                                        ? `/extend-requests/${request.id_extend_request}/reject-tl`
                                        : `/extend-requests/${request.id_extend_request}/reject-hod`;
                                    router.post(url, { notes: rejectNotes });
                                }}
                            >
                                <XCircle className="mr-1 size-3.5" /> Reject
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowReject(false)}>
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setShowReject(true)}>
                                <XCircle className="mr-1 size-3.5" /> Reject
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    const url = needsTlApproval
                                        ? `/extend-requests/${request.id_extend_request}/approve-tl`
                                        : `/extend-requests/${request.id_extend_request}/approve-hod`;
                                    router.post(url);
                                }}
                            >
                                <CheckCircle className="mr-1 size-3.5" /> Approve
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
