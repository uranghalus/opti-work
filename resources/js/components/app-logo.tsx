import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-white shadow-sm">
                <AppLogoIcon className="size-5 fill-[#0071b7]" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Optiwork
                </span>
                <span className="truncate leading-tight text-[10px] font-medium tracking-wider text-sidebar-foreground/50 uppercase">
                    Work Management System
                </span>
            </div>
        </>
    );
}
