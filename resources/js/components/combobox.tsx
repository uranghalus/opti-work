import { ChevronsUpDown, Check } from 'lucide-react'
import React, { useState, useId } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export interface SelectOption {
    label: string
    value: string
}
interface SearchableSelectProps {
    options: SelectOption[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    className?: string
}
export default function Combobox({
    options,
    value,
    onChange,
    placeholder = "Pilih opsi...",
    searchPlaceholder = "Cari...",
    emptyText = "Data tidak ditemukan.",
    className,
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
    const id = useId();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    id={id}
                    ref={(node) => {
                        if (node) {
                            setTriggerWidth(node.offsetWidth);
                        }
                    }}
                >
                    {value
                        ? options.find((option) => option.value === value)?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className={cn("p-0", className)}
                style={{
                    width: triggerWidth ? `${triggerWidth}px` : '100%',
                    minWidth: triggerWidth ? `${triggerWidth}px` : undefined,
                }}
                align="start"
            >
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        // Beri tahu parent component tentang perubahan nilai
                                        onChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
