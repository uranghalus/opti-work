export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header className={variant === 'small' ? '' : 'mb-8 space-y-1'}>
            <h2
                className={
                    variant === 'small'
                        ? 'mb-0.5 text-base font-semibold tracking-tight text-foreground'
                        : 'text-xl font-bold tracking-tight text-foreground'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
        </header>
    );
}
