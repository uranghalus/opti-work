import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#0093dd] shadow-sm">
                <AppLogoIcon className="size-5 fill-primary-foreground" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-foreground">
                    Optiwork
                </span>
                <span className="truncate leading-tight text-[10px] font-medium tracking-wider text-muted-foreground/60 uppercase">
                    Work Management System
                </span>
            </div>
        </>
    );
}
