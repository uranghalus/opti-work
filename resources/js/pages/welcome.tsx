import { Head, Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard } from '@/routes';

const features = [
    {
        title: 'Manajemen Proyek',
        description: 'Kelola proyek dengan mudah, pantau progres tim, dan capai target tepat waktu.',
        icon: <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" /></svg>,
    },
    {
        title: 'Kolaborasi Tim',
        description: 'Tingkatkan produktivitas tim dengan komunikasi terpusat dan pembagian tugas yang efisien.',
        icon: <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
    {
        title: 'Pelaporan Real-time',
        description: 'Dapatkan insight lengkap dengan dashboard dan laporan yang dapat diakses kapan saja.',
        icon: <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-6" /></svg>,
    },
    {
        title: 'Keamanan Data',
        description: 'Lindungi data perusahaan dengan enkripsi dan kontrol akses berlapis.',
        icon: <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    },
];

function useInView(threshold = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
 if (e.isIntersecting) {
setIsInView(true);
} 
}, { threshold });

        if (ref.current) {
obs.observe(ref.current);
}

        return () => obs.disconnect();
    }, [threshold]);

    return { ref, isInView };
}

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
    const [count, setCount] = useState(0);
    const { ref, isInView } = useInView(0.3);
    useEffect(() => {
        if (!isInView) {
return;
}

        let start: number;
        const step = (ts: number) => {
 if (!start) {
start = ts;
}

 const p = Math.min((ts - start) / duration, 1); setCount(Math.floor(p * target));

 if (p < 1) {
requestAnimationFrame(step);
} 
};
        requestAnimationFrame(step);
    }, [isInView, target, duration]);

    return <span ref={ref}>{count}</span>;
}

export default function Welcome() {
    const { auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const [heroIn, setHeroIn] = useState(false);
    const [statsIn, setStatsIn] = useState(false);
    const [featuresIn, setFeaturesIn] = useState(false);
    const [ctaIn, setCtaIn] = useState(false);
    const statsRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
 const t = setTimeout(() => setHeroIn(true), 100);

 return () => clearTimeout(t); 
}, []);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
 if (e.isIntersecting) {
 setStatsIn(true); 
} 
}, { threshold: 0.2 });

        if (statsRef.current) {
obs.observe(statsRef.current);
}

        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
 if (e.isIntersecting) {
 setFeaturesIn(true); 
} 
}, { threshold: 0.1 });

        if (featuresRef.current) {
obs.observe(featuresRef.current);
}

        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
 if (e.isIntersecting) {
 setCtaIn(true); 
} 
}, { threshold: 0.2 });

        if (ctaRef.current) {
obs.observe(ctaRef.current);
}

        return () => obs.disconnect();
    }, []);

    const transition = 'transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]';

    return (
        <>
            <Head title="Selamat Datang" />

            <div className="flex min-h-screen flex-col bg-background">
                {/* Header — Fluid Island Nav */}
                <header className="fixed top-0 z-50 w-full">
                    <div className={`mx-auto mt-4 w-max rounded-full border border-border/30 bg-background/80 px-5 py-2.5 shadow-lg backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${menuOpen ? 'scale-95 opacity-0 pointer-events-none' : ''}`}>
                        <div className="flex items-center gap-6">
                            <Link href={dashboard()} className="flex items-center gap-2.5">
                                <div className="flex size-8 items-center justify-center rounded-full bg-primary shadow-sm"><AppLogoIcon className="size-4 fill-primary-foreground" /></div>
                                <span className="text-sm font-bold tracking-tight text-foreground">Optiwork</span>
                            </Link>
                            <nav className="hidden items-center gap-1 md:flex">
                                {['Fitur', 'Tentang', 'Kontak'].map((item) => (
                                    <a key={item} href="#" className="rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-accent hover:text-foreground">{item}</a>
                                ))}
                            </nav>
                            <div className="flex items-center gap-2">
                                {auth.user ? (
                                    <Link href={dashboard()} className="group relative inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]">
                                        Dashboard
                                        <span className="flex size-4 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5">
                                            <svg className="size-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        </span>
                                    </Link>
                                ) : (
                                    <a href="/auth/redirect" className="group relative inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]">
                                        Masuk
                                        <span className="flex size-4 items-center justify-center rounded-full bg-white/15 transition-all duration-500 group-hover:translate-x-0.5">
                                            <svg className="size-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        </span>
                                    </a>
                                )}
                                <button onClick={() => setMenuOpen(true)} className="flex size-8 items-center justify-center rounded-full bg-accent text-foreground md:hidden"><Menu className="size-4" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu — Full-screen overlay */}
                    {menuOpen && (
                        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-3xl">
                            <button onClick={() => setMenuOpen(false)} className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-full bg-accent text-foreground"><X className="size-5" /></button>
                            <nav className="flex flex-col items-center gap-6">
                                {['Fitur', 'Tentang', 'Kontak'].map((item, i) => (
                                    <a key={item} href="#" onClick={() => setMenuOpen(false)} className="text-2xl font-bold text-foreground/60 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-foreground"
                                        style={{ animation: `fadeInUp 0.6s cubic-bezier(0.32,0.72,0,1) ${i * 0.1}s both` }}>{item}</a>
                                ))}
                                <div className="mt-4 h-px w-16 bg-border" />
                                {auth.user ? (
                                    <Link href={dashboard()} onClick={() => setMenuOpen(false)} className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg">Dashboard</Link>
                                ) : (
                                    <a href="/auth/redirect" onClick={() => setMenuOpen(false)} className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg">Mulai Sekarang</a>
                                )}
                            </nav>
                        </div>
                    )}
                </header>

                <main className="flex-1">
                    {/* Hero */}
                    <section className="relative min-h-screen overflow-hidden pt-20">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.07] via-transparent to-transparent" />
                        <div className="absolute -top-40 right-[-10%] size-[500px] rounded-full bg-primary/10 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
                        <div className="absolute -bottom-40 left-[-10%] size-[500px] rounded-full bg-[#0093dd]/10 blur-[100px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
                        <div className="absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '4s' }} />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.535_0.134_214.8/0.08)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.535_0.134_214.8/0.08)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] bg-[size:60px_60px]" />

                        <div className="relative mx-auto flex max-w-6xl items-center px-6 py-24 lg:min-h-[calc(100vh-5rem)] lg:py-32">
                            <div className="mx-auto max-w-3xl text-center">
                                <div className={`mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-background/60 px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur-sm ${transition} ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                                        <span className="relative inline-flex size-2 rounded-full bg-primary" />
                                    </span>
                                    Sistem Manajemen Kerja Internal
                                </div>

                                <h1 className={`mb-8 text-4xl leading-[1.1] font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl ${transition} delay-100 ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                    Kelola Pekerjaan,{' '}
                                    <span className="relative">
                                        <span className="bg-gradient-to-r from-primary via-[#0093dd] to-[#76c5f0] bg-clip-text text-transparent">Tingkatkan Produktivitas</span>
                                        <span className="absolute -bottom-1 left-0 h-[3px] w-full animate-[expandWidth_1s_ease-out_0.8s_both] rounded-full bg-gradient-to-r from-primary to-[#0093dd]" />
                                    </span>
                                </h1>

                                <p className={`mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground ${transition} delay-200 ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                    Platform terpadu untuk mengelola proyek, tugas, dan kolaborasi tim perusahaan Anda. Bekerja lebih cerdas, cepat, dan efisien bersama Optiwork.
                                </p>

                                <div className={`flex flex-col items-center justify-center gap-4 sm:flex-row ${transition} delay-300 ${heroIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                    {auth.user ? (
                                        <Link href={dashboard()} className="group relative inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.97]">
                                            Buka Dashboard
                                            <span className="flex size-6 items-center justify-center rounded-full bg-white/15 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                                                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                            </span>
                                        </Link>
                                    ) : (
                                        <>
                                            <a href="/auth/redirect" className="group relative inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.97]">
                                                Mulai Sekarang
                                                <span className="flex size-6 items-center justify-center rounded-full bg-white/15 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                                                    <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                </span>
                                            </a>
                                            <a href="/auth/redirect" className="group inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-primary/30 hover:bg-background hover:text-primary hover:shadow-lg active:scale-[0.97]">
                                                Pelajari Lebih Lanjut
                                                <span className="flex size-5 items-center justify-center rounded-full bg-accent transition-all duration-700 group-hover:translate-x-0.5">
                                                    <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                                </span>
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Scroll indicator */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                            <div className="flex size-10 items-center justify-center rounded-full border border-border/50 bg-background/50 backdrop-blur-sm">
                                <svg className="size-5 text-muted-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </section>

                    {/* Stats — Double-Bezel */}
                    <section ref={statsRef} className="relative border-t border-border/50 bg-accent/30">
                        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {[
                                    { value: 150, suffix: '+', label: 'Karyawan Aktif' },
                                    { value: 98, suffix: '%', label: 'Tingkat Kepuasan' },
                                    { value: 500, suffix: '+', label: 'Proyek Selesai' },
                                    { value: 24, suffix: '/7', label: 'Dukungan Tim' },
                                ].map((stat, i) => (
                                    <div key={stat.label}
                                        className={`rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 ${transition} ${statsIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                        style={{ transitionDelay: `${i * 100 + 100}ms` }}>
                                        <div className="rounded-[calc(1.5rem-0.375rem)] bg-background py-6 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-md">
                                            <div className="text-3xl font-bold text-foreground transition-colors lg:text-4xl">
                                                <AnimatedCounter target={stat.value} /><span>{stat.suffix}</span>
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Features — Double-Bezel */}
                    <section ref={featuresRef} className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent" />
                        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
                            <div className="mx-auto mb-16 max-w-2xl text-center">
                                <div className={`mb-4 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase ${transition} ${featuresIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Fitur Unggulan</div>
                                <h2 className={`mb-5 text-3xl font-bold tracking-tight text-foreground lg:text-4xl ${transition} delay-100 ${featuresIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Solusi Lengkap untuk Tim Anda</h2>
                                <p className={`text-base leading-relaxed text-muted-foreground ${transition} delay-150 ${featuresIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Fitur-fitur yang dirancang untuk mengoptimalkan alur kerja dan meningkatkan efisiensi perusahaan Anda.</p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                {features.map((feature, idx) => (
                                    <div key={feature.title}
                                        className={`rounded-[1.5rem] border border-border/30 bg-black/[0.015] p-1.5 dark:bg-white/[0.015] ${transition}`}
                                        style={{ transitionDelay: `${idx * 100 + 200}ms`, opacity: featuresIn ? 1 : 0, transform: featuresIn ? 'translateY(0)' : 'translateY(24px)' }}>
                                        <div className="group rounded-[calc(1.5rem-0.375rem)] bg-background p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-md">
                                            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
                                                {feature.icon}
                                            </div>
                                            <h3 className="mb-2.5 text-lg font-semibold text-foreground">{feature.title}</h3>
                                            <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                                            <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-100">
                                                <span>Selengkapnya</span>
                                                <svg className="size-3.5 transition-transform duration-700 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section ref={ctaRef} className="relative overflow-hidden border-t border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#0093dd]" />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

                        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-24">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className={`mb-5 text-3xl font-bold tracking-tight text-white lg:text-4xl ${transition} ${ctaIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Siap Meningkatkan Produktivitas?</h2>
                                <p className={`mb-10 text-base leading-relaxed text-white/80 ${transition} delay-100 ${ctaIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>Bergabunglah dengan tim yang sudah menggunakan Optiwork untuk mengelola pekerjaan mereka secara efisien.</p>
                                <div className={`${transition} delay-200 ${ctaIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                    {auth.user ? (
                                        <Link href={dashboard()} className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-2xl active:scale-[0.97]">
                                            Buka Dashboard
                                            <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 transition-all duration-700 group-hover:translate-x-0.5">
                                                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                            </span>
                                        </Link>
                                    ) : (
                                        <a href="/auth/redirect" className="group inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-2xl active:scale-[0.97]">
                                            Mulai Sekarang
                                            <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 transition-all duration-700 group-hover:translate-x-0.5">
                                                <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                            </span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-border/50 bg-background">
                    <div className="mx-auto max-w-6xl px-6 py-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-7 items-center justify-center rounded-md bg-primary shadow-sm"><AppLogoIcon className="size-4 fill-primary-foreground" /></div>
                                <div className="grid">
                                    <span className="text-sm leading-tight font-semibold text-foreground">Optiwork</span>
                                    <span className="text-[9px] font-medium tracking-wider text-muted-foreground uppercase">Work Management System</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Optiwork. Hak cipta dilindungi.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
