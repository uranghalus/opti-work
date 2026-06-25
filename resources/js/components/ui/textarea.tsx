import { cn } from '@/lib/utils';

function Textarea({ className, ref, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            className={cn(
                'flex min-h-15 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-neutral-400 focus-visible:border-[#0071b7] focus-visible:ring-[3px] focus-visible:ring-[#0071b7]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-700 dark:placeholder:text-neutral-500 dark:focus-visible:border-[#0093dd]',
                className
            )}
            ref={ref}
            {...props}
        />
    );
}

export { Textarea };
