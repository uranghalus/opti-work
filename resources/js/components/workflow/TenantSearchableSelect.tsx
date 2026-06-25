import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

type Tenant = {
    id: number;
    name: string;
};

type TenantSearchableSelectProps = {
    tenants: Tenant[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
};

export function TenantSearchableSelect({
    tenants,
    value,
    onChange,
    placeholder = 'Select tenant...',
    error,
}: TenantSearchableSelectProps) {
    const [open, setOpen] = React.useState(false);

    const selectedTenant = tenants.find((t) => t.id.toString() === value);

    return (
        <div className="grid gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {selectedTenant ? selectedTenant.name : placeholder}
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Search tenant..." />
                        <CommandList>
                            <CommandEmpty>No tenant found.</CommandEmpty>
                            <CommandGroup>
                                {tenants.map((tenant) => (
                                    <CommandItem
                                        key={tenant.id}
                                        value={tenant.id.toString()}
                                        onSelect={(currentValue) => {
                                            onChange(currentValue);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 size-4',
                                                value === tenant.id.toString()
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            )}
                                        />
                                        {tenant.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && (
                <p className="flex items-center gap-1 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}
