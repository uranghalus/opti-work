import { router } from '@inertiajs/react';
import { useEffect } from 'react';

type WorkOrderUpdate = {
    id: number;
    no_work_order: string;
    status_tiket: string | null;
    status_pekerjaan: string | null;
    assigned_employees: Array<{ id: number; name: string }> | null;
    personnel_count: number | null;
    completion_results: string | null;
    updated_at: string;
    previous_status: string;
};

export function useWorkOrderBroadcast(
    workOrderId?: number,
    onUpdate?: (data: WorkOrderUpdate) => void,
) {
    useEffect(() => {
        let echo: any;

        const initEcho = async () => {
            try {
                const mod = await import('@/echo');
                echo = mod.default;

                echo
                    .private('work-orders')
                    .listen('.WorkOrderStatusChanged', (e: any) => {
                        const data = e as WorkOrderUpdate;

                        // If we're on a specific WO detail page and this update is for it
                        if (workOrderId && data.id === workOrderId) {
                            if (onUpdate) {
                                onUpdate(data);
                            } else {
                                router.reload({
                                    only: ['workOrder'],
                                    preserveScroll: true,
                                });
                            }
                            return;
                        }

                        // If we're on the index page, reload silently
                        if (!workOrderId) {
                            router.reload({
                                only: ['workOrders'],
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }
                    });
            } catch {
                // Echo not available — fallback is polling
            }
        };

        initEcho();

        return () => {
            if (echo) {
                try {
                    echo.leaveChannel('work-orders');
                } catch {
                    // ignore
                }
            }
        };
    }, [workOrderId]);
}
