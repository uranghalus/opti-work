import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard } from '@/routes';

const features = [
    {
        title: 'Manajemen Proyek',
        description:
            'Kelola proyek dengan mudah, pantau progres tim, dan capai target tepat waktu.',
        icon: (
            <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
            </svg>
        ),
        gradient: 'from-[#0071b7] to-[#0093dd]',
    },
    {
        title: 'Kolaborasi Tim',
        description:
            'Tingkatkan produktivitas tim dengan komunikasi terpusat dan pembagian tugas yang efisien.',
        icon: (
            <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        gradient: 'from-[#0093dd] to-[#76c5f0]',
    },
    {
        title: 'Pelaporan Real-time',
        description:
            'Dapatkan insight lengkap dengan dashboard dan laporan yang dapat diakses kapan saja.',
        icon: (
            <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M3 3v18h18" />
                <path d="M7 16l4-8 4 4 4-6" />
            </svg>
        ),
        gradient: 'from-[#015198] to-[#0071b7]',
    },
    {
        title: 'Keamanan Data',
        description:
            'Lindungi data perusahaan dengan enkripsi dan kontrol akses berlapis.',
        icon: (
            <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
        ),
        gradient: 'from-[#0071b7] to-[#015198]',
    },
];

function useInView() {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                }
            },
            { threshold: 0.1 },
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return { ref, isInView };
}

function AnimatedCounter({
    target,
    duration = 2000,
}: {
    target: number;
    duration?: number;
}) {
    const [count, setCount] = useState(0);
    const { ref, isInView } = useInView();

    useEffect(() => {
        if (!isInView) {
            return;
        }

        let startTime: number;
        const step = (timestamp: number) => {
            if (!startTime) {
                startTime = timestamp;
            }

            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * target));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }, [isInView, target, duration]);

    return <span ref={ref}>{count}</span>;
}

export default function Welcome() {
    const { auth } = usePage().props;
    const [headerScrolled, setHeaderScrolled] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);
    const [featuresVisible, setFeaturesVisible] = useState(false);
    const featuresRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setHeaderScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setFeaturesVisible(true);
                }
            },
            { threshold: 0.1 },
        );

        if (featuresRef.current) {
            observer.observe(featuresRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <Head title="Selamat Datang" />

            <div className="flex min-h-screen flex-col bg-white dark:bg-[#050a14]">
                {/* Header */}
                <header
                    className={`fixed top-0 z-50 w-full transition-all duration-300 ${headerScrolled
                        ? 'border-b border-gray-200/50 bg-white/80 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-[#050a14]/80'
                        : 'bg-transparent'
                        }`}
                >
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="relative flex size-9 items-center justify-center rounded-lg bg-white shadow-md dark:bg-white">
                                <AppLogoIcon className="size-5 fill-[#0071b7]" />
                            </div>
                            <div className="grid flex-1 text-left">
                                <span className="text-lg leading-tight font-bold tracking-tight text-gray-900 dark:text-white">
                                    Optiwork
                                </span>
                                <span className="text-[10px] font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
                                    Work Management System
                                </span>
                            </div>
                        </div>
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-[#0071b7] to-[#0093dd] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#0071b7]/25 transition-all duration-300 hover:shadow-lg hover:shadow-[#0071b7]/30"
                                >
                                    <span className="relative z-10">
                                        Dashboard
                                    </span>
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[#015198] to-[#0071b7] transition-transform duration-300 group-hover:translate-x-0" />
                                </Link>
                            ) : (
                                <a
                                    href={'/auth/redirect'}
                                    className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-[#0071b7] to-[#0093dd] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#0071b7]/25 transition-all duration-300 hover:shadow-lg hover:shadow-[#0071b7]/30"
                                >
                                    <span className="relative z-10">Masuk</span>
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[#015198] to-[#0071b7] transition-transform duration-300 group-hover:translate-x-0" />
                                </a>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-1">
                    <section className="relative min-h-screen overflow-hidden pt-20">
                        {/* Animated background */}
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0071b7]/[0.07] via-transparent to-transparent dark:from-[#0071b7]/[0.15]" />
                            <div className="absolute -top-40 right-[-10%] size-[500px] animate-pulse rounded-full bg-[#76c5f0]/[0.08] blur-[100px] dark:bg-[#0093dd]/[0.12]" />
                            <div className="absolute -bottom-40 left-[-10%] size-[500px] animate-pulse rounded-full bg-[#0071b7]/[0.08] blur-[100px] [animation-delay:2s] dark:bg-[#0071b7]/[0.12]" />
                            <div className="absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#0093dd]/[0.04] blur-[120px] [animation-delay:4s] dark:bg-[#0093dd]/[0.08]" />
                        </div>

                        {/* Floating grid pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0071b710_1px,transparent_1px),linear-gradient(to_bottom,#0071b710_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] bg-[size:60px_60px] dark:bg-[linear-gradient(to_right,#0071b720_1px,transparent_1px),linear-gradient(to_bottom,#0071b720_1px,transparent_1px)]" />

                        <div
                            ref={heroRef}
                            className="relative mx-auto flex max-w-6xl items-center px-6 py-24 lg:min-h-[calc(100vh-5rem)] lg:py-32"
                        >
                            <div className="mx-auto max-w-3xl text-center">
                                {/* Badge */}
                                <div className="mb-8 inline-flex animate-[fadeInUp_0.6s_ease-out_both] items-center gap-2.5 rounded-full border border-[#0071b7]/20 bg-white/60 px-4 py-2 text-sm font-medium text-[#0071b7] shadow-sm backdrop-blur-sm dark:border-[#0093dd]/20 dark:bg-white/[0.03] dark:text-[#76c5f0] dark:shadow-none">
                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#0071b7] opacity-75 dark:bg-[#0093dd]" />
                                        <span className="relative inline-flex size-2 rounded-full bg-[#0071b7] dark:bg-[#0093dd]" />
                                    </span>
                                    Sistem Manajemen Kerja Internal
                                </div>

                                {/* Heading */}
                                <h1 className="mb-8 animate-[fadeInUp_0.6s_ease-out_0.1s_both] text-4xl leading-[1.1] font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
                                    Kelola Pekerjaan,{' '}
                                    <span className="relative">
                                        <span className="bg-gradient-to-r from-[#0071b7] via-[#0093dd] to-[#76c5f0] bg-clip-text text-transparent dark:from-[#0093dd] dark:via-[#76c5f0] dark:to-[#a8dcf5]">
                                            Tingkatkan Produktivitas
                                        </span>
                                        <span className="absolute -bottom-1 left-0 h-[3px] w-full animate-[expandWidth_1s_ease-out_0.8s_both] rounded-full bg-gradient-to-r from-[#0071b7] to-[#0093dd] dark:from-[#0093dd] dark:to-[#76c5f0]" />
                                    </span>
                                </h1>

                                {/* Description */}
                                <p className="mx-auto mb-12 max-w-2xl animate-[fadeInUp_0.6s_ease-out_0.2s_both] text-lg leading-relaxed text-gray-500 dark:text-gray-400">
                                    Platform terpadu untuk mengelola proyek,
                                    tugas, dan kolaborasi tim perusahaan Anda.
                                    Bekerja lebih cerdas, cepat, dan efisien
                                    bersama Optiwork.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex animate-[fadeInUp_0.6s_ease-out_0.3s_both] flex-col items-center justify-center gap-4 sm:flex-row">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#0071b7] to-[#0093dd] px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-[#0071b7]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#0071b7]/30"
                                        >
                                            <span className="relative z-10">
                                                Buka Dashboard
                                            </span>
                                            <svg
                                                className="relative z-10 size-4 transition-transform duration-300 group-hover:translate-x-1"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[#015198] to-[#0071b7] transition-transform duration-500 group-hover:translate-x-0" />
                                        </Link>
                                    ) : (
                                        <>
                                            <a
                                                href={'/auth/redirect'}
                                                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#0071b7] to-[#0093dd] px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-[#0071b7]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#0071b7]/30"
                                            >
                                                <span className="relative z-10">
                                                    Mulai Sekarang
                                                </span>
                                                <svg
                                                    className="relative z-10 size-4 transition-transform duration-300 group-hover:translate-x-1"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[#015198] to-[#0071b7] transition-transform duration-500 group-hover:translate-x-0" />
                                            </a>
                                            <a
                                                href={'/auth/redirect'}
                                                className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/50 px-8 py-4 text-sm font-semibold text-gray-700 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0071b7]/30 hover:bg-white hover:text-[#0071b7] hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-[#0093dd]/30 dark:hover:bg-white/10 dark:hover:text-[#76c5f0]"
                                            >
                                                Pelajari Lebih Lanjut
                                                <svg
                                                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Scroll indicator */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                            <div className="flex size-10 items-center justify-center rounded-full border border-gray-200/50 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                                <svg
                                    className="size-5 text-gray-400 dark:text-gray-500"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 5v14M19 12l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className="relative border-t border-gray-100 bg-gray-50/80 dark:border-white/5 dark:bg-[#0a1020]">
                        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
                            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                                {[
                                    {
                                        value: 150,
                                        suffix: '+',
                                        label: 'Karyawan Aktif',
                                    },
                                    {
                                        value: 98,
                                        suffix: '%',
                                        label: 'Tingkat Kepuasan',
                                    },
                                    {
                                        value: 500,
                                        suffix: '+',
                                        label: 'Proyek Selesai',
                                    },
                                    {
                                        value: 24,
                                        suffix: '/7',
                                        label: 'Dukungan Tim',
                                    },
                                ].map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="group text-center"
                                    >
                                        <div className="mb-2 text-3xl font-bold text-gray-900 transition-colors group-hover:text-[#0071b7] lg:text-4xl dark:text-white dark:group-hover:text-[#0093dd]">
                                            <AnimatedCounter
                                                target={stat.value}
                                            />
                                            <span>{stat.suffix}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="relative overflow-hidden dark:bg-[#050a14]">
                        {/* Background */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#0071b7]/[0.03] via-transparent to-transparent dark:from-[#0071b7]/[0.08]" />

                        <div
                            ref={featuresRef}
                            className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28"
                        >
                            <div className="mx-auto mb-16 max-w-2xl text-center">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0071b7]/10 bg-[#0071b7]/5 px-3 py-1 text-xs font-medium tracking-wide text-[#0071b7] uppercase dark:border-[#0093dd]/20 dark:bg-[#0093dd]/10 dark:text-[#76c5f0]">
                                    Fitur Unggulan
                                </div>
                                <h2 className="mb-5 text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl dark:text-white">
                                    Solusi Lengkap untuk Tim Anda
                                </h2>
                                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                                    Fitur-fitur yang dirancang untuk
                                    mengoptimalkan alur kerja dan meningkatkan
                                    efisiensi perusahaan Anda.
                                </p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                {features.map((feature, index) => (
                                    <div
                                        key={feature.title}
                                        className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0071b7]/[0.08] dark:border-white/[0.06] dark:bg-[#0a1020] dark:hover:border-[#0093dd]/20 dark:hover:shadow-[#0093dd]/[0.05] ${featuresVisible
                                            ? 'translate-y-0 opacity-100'
                                            : 'translate-y-8 opacity-0'
                                            }`}
                                        style={{
                                            transitionDelay: `${index * 100}ms`,
                                        }}
                                    >
                                        {/* Card hover gradient */}
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.06]`}
                                        />

                                        {/* Icon */}
                                        <div
                                            className={`relative mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg shadow-[#0071b7]/20 transition-transform duration-300 group-hover:scale-110`}
                                        >
                                            {feature.icon}
                                        </div>

                                        {/* Content */}
                                        <h3 className="relative mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="relative text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                            {feature.description}
                                        </p>

                                        {/* Arrow */}
                                        <div className="relative mt-5 flex items-center gap-1.5 text-sm font-medium text-[#0071b7] opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-[#76c5f0]">
                                            <span>Selengkapnya</span>
                                            <svg
                                                className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="relative overflow-hidden border-t border-gray-100 dark:border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0071b7] to-[#0093dd] dark:from-[#015198] dark:to-[#0071b7]" />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

                        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-24">
                            <div className="mx-auto max-w-2xl text-center">
                                <h2 className="mb-5 text-3xl font-bold tracking-tight text-white lg:text-4xl">
                                    Siap Meningkatkan Produktivitas?
                                </h2>
                                <p className="mb-10 text-base leading-relaxed text-white/80">
                                    Bergabunglah dengan tim yang sudah
                                    menggunakan Optiwork untuk mengelola
                                    pekerjaan mereka secara efisien.
                                </p>
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-[#0071b7] shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                                    >
                                        Buka Dashboard
                                        <svg
                                            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <a
                                        href={'/auth/redirect'}
                                        className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-[#0071b7] shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                                    >
                                        Mulai Sekarang
                                        <svg
                                            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-gray-100 bg-white dark:border-white/5 dark:bg-[#050a14]">
                    <div className="mx-auto max-w-6xl px-6 py-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="flex items-center gap-2.5">
                                <div className="flex size-7 items-center justify-center rounded-md bg-white shadow-md dark:bg-white">
                                    <AppLogoIcon className="size-4 fill-[#0071b7]" />
                                </div>
                                <div className="grid flex-1 text-left">
                                    <span className="text-sm leading-tight font-semibold text-gray-900 dark:text-white">
                                        Optiwork
                                    </span>
                                    <span className="text-[9px] font-medium tracking-wider text-gray-400 uppercase dark:text-gray-500">
                                        Work Management System
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                &copy; {new Date().getFullYear()} Optiwork. Hak
                                cipta dilindungi.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
