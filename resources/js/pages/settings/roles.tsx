import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as rolesIndex, destroy as rolesDestroy } from '@/routes/roles';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';

type Permission = { id: number; name: string; guard_name: string };
type Role = { id: number; name: string; guard_name: string; permissions: Permission[] };

type PageProps = {
    roles: Role[];
    permissions: Record<string, Permission[]>;
};

export default function Roles() {
    const { roles, permissions } = usePage<PageProps>().props;
    const [editingRole, setEditingRole] = useState<number | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    return (
        <>
            <Head title="Roles & Permissions" />

            <div className="space-y-8">
                <Heading
                    variant="small"
                    title="Roles & Permissions"
                    description="Manage roles and their permission assignments"
                />

                {/* Create new role */}
                <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
                    <div className="rounded-[calc(0.75rem-4px)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                        <button
                            onClick={() => setShowCreate(!showCreate)}
                            className="flex w-full items-center justify-between text-sm font-medium text-foreground"
                        >
                            <span className="flex items-center gap-2">
                                <Plus className="size-4" />
                                Create New Role
                            </span>
                            {showCreate ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </button>

                        {showCreate && (
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const data = new FormData(e.currentTarget);
                                    router.post('/settings/roles', {
                                        name: data.get('name'),
                                        permissions: data.getAll('permissions'),
                                    }, {
                                        onSuccess: () => setShowCreate(false),
                                    });
                                }}
                                className="mt-4 space-y-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="new-role-name" className="text-sm font-medium">
                                        Role Name
                                    </Label>
                                    <Input
                                        id="new-role-name"
                                        name="name"
                                        required
                                        placeholder="e.g. project_manager"
                                        className="rounded-xl border-border/40 bg-background"
                                    />
                                </div>

                                <PermissionGrid permissions={permissions} prefix="permissions" />

                                <Button type="submit" size="sm">
                                    Create Role
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Existing roles */}
                <div className="space-y-3">
                    {roles.map((role) => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            permissions={permissions}
                            isEditing={editingRole === role.id}
                            onToggleEdit={() => setEditingRole(editingRole === role.id ? null : role.id)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

function RoleCard({
    role,
    permissions,
    isEditing,
    onToggleEdit,
}: {
    role: Role;
    permissions: Record<string, Permission[]>;
    isEditing: boolean;
    onToggleEdit: () => void;
}) {
    const isSuperAdmin = role.name === 'super_admin';
    const rolePermissionNames = role.permissions.map((p) => p.name);

    return (
        <div className="rounded-xl border border-border/40 bg-black/[0.02] p-1 dark:bg-white/[0.02]">
            <div className="rounded-[calc(0.75rem-4px)] bg-background p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">{role.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={onToggleEdit}>
                            {isEditing ? 'Cancel' : 'Edit'}
                        </Button>
                        {!isSuperAdmin && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                    if (confirm(`Delete role "${role.name}"?`)) {
                                        router.delete(rolesDestroy.url(role.id));
                                    }
                                }}
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const data = new FormData(e.currentTarget);
                            router.put(`/settings/roles/${role.id}`, {
                                name: data.get('name'),
                                permissions: data.getAll('permissions'),
                            }, {
                                onSuccess: onToggleEdit,
                            });
                        }}
                        className="mt-4 space-y-4 border-t border-border/30 pt-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor={`role-name-${role.id}`} className="text-sm font-medium">
                                Role Name
                            </Label>
                            <Input
                                id={`role-name-${role.id}`}
                                name="name"
                                defaultValue={role.name}
                                required
                                className="rounded-xl border-border/40 bg-background"
                            />
                        </div>

                        <PermissionGrid
                            permissions={permissions}
                            prefix={`permissions`}
                            defaultChecked={rolePermissionNames}
                        />

                        <Button type="submit" size="sm">
                            Save Changes
                        </Button>
                    </form>
                )}

                {!isEditing && role.permissions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {role.permissions.slice(0, 8).map((p) => (
                            <span
                                key={p.id}
                                className="inline-block rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary"
                            >
                                {p.name}
                            </span>
                        ))}
                        {role.permissions.length > 8 && (
                            <span className="inline-block rounded-full border border-border/40 bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                +{role.permissions.length - 8} more
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function PermissionGrid({
    permissions,
    prefix,
    defaultChecked = [],
}: {
    permissions: Record<string, Permission[]>;
    prefix: string;
    defaultChecked?: string[];
}) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleGroup = (group: string) => {
        setExpanded((prev) => ({ ...prev, [group]: !prev[group] }));
    };

    return (
        <div className="space-y-3">
            {Object.entries(permissions).map(([group, perms]) => {
                const allChecked = perms.every((p) => defaultChecked.includes(p.name));
                const someChecked = perms.some((p) => defaultChecked.includes(p.name));

                return (
                    <div key={group} className="rounded-lg border border-border/30 p-3">
                        <button
                            type="button"
                            onClick={() => toggleGroup(group)}
                            className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                            <span className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    readOnly
                                    checked={allChecked}
                                    ref={(el) => {
                                        if (el) el.indeterminate = someChecked && !allChecked;
                                    }}
                                    className="size-3.5 rounded border-border/50"
                                />
                                {group}
                            </span>
                            {expanded[group] ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                        </button>

                        {(expanded[group] || someChecked) && (
                            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                                {perms.map((perm) => (
                                    <label
                                        key={perm.id}
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        <input
                                            type="checkbox"
                                            name={`${prefix}[]`}
                                            value={perm.name}
                                            defaultChecked={defaultChecked.includes(perm.name)}
                                            className="size-3.5 rounded border-border/50"
                                        />
                                        {perm.name.split('.')[1]}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
