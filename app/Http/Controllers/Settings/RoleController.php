<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): Response
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all()->groupBy(fn (Permission $p) => explode('.', $p->name)[0]);

        return Inertia::render('settings/roles', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);
        $role->syncPermissions($validated['permissions']);

        return redirect()->route('rbac.index')->with('success', 'Role created.');
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,'.$role->id,
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions']);

        return redirect()->route('rbac.index')->with('success', 'Role updated.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->name === 'super_admin') {
            return redirect()->route('rbac.index')->withErrors(['name' => 'Cannot delete super_admin role.']);
        }

        $role->delete();

        return redirect()->route('rbac.index')->with('success', 'Role deleted.');
    }

    public function syncPermissions(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($validated['permissions']);

        return redirect()->route('rbac.index')->with('success', 'Permissions updated.');
    }
}
