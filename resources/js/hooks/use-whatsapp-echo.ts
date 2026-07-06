import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export function useWhatsappEcho(sessionNames: string[]) {
    useEffect(() => {
        if (sessionNames.length === 0) return;

        let echoes: any[] = [];

        const initEcho = async () => {
            const echo = (await import('@/echo')).default;

            sessionNames.forEach((name) => {
                const channel = echo.channel(`whatsapp.session.${name}`);

                channel.listen('.session.status.updated', (e: any) => {
                    router.reload({ only: ['sessions'], preserveScroll: true });
                });

                echoes.push(channel);
            });
        };

        initEcho();

        return () => {
            echoes.forEach((ch) => ch.unsubscribe());
            echoes = [];
        };
    }, [sessionNames.join(',')]);
}
