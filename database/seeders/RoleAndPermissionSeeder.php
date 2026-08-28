<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // --- Permissions ---

        // Master Data
        $masterDataPermissions = [
            'division.create', 'division.read', 'division.update', 'division.delete',
            'department.create', 'department.read', 'department.update', 'department.delete',
            'employee.create', 'employee.read', 'employee.update', 'employee.delete',
            'tenant.create', 'tenant.read', 'tenant.update', 'tenant.delete',
        ];

        // Work Order
        $workOrderPermissions = [
            'work-order.create', 'work-order.read', 'work-order.update',
            'work-order.review', 'work-order.assign', 'work-order.submit', 'work-order.verify',
        ];

        // Work Planning
        $workPlanningPermissions = [
            'work-planning.create', 'work-planning.read', 'work-planning.update', 'work-planning.delete',
        ];

        // Work Data
        $workDataPermissions = [
            'work-data.create', 'work-data.read', 'work-data.update',
        ];

        // Daily Work
        $dailyWorkPermissions = [
            'daily-work.create', 'daily-work.read', 'daily-work.update',
        ];

        // Inventory
        $inventoryPermissions = [
            'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
        ];

        // Correspondence
        $correspondencePermissions = [
            'correspondence.create', 'correspondence.read', 'correspondence.update',
        ];

        // System
        $systemPermissions = [
            'rbac.manage', 'tenant.manage', 'dashboard.read', 'reports.read',
        ];

        $allPermissions = array_merge(
            $masterDataPermissions,
            $workOrderPermissions,
            $workPlanningPermissions,
            $workDataPermissions,
            $dailyWorkPermissions,
            $inventoryPermissions,
            $correspondencePermissions,
            $systemPermissions,
        );

        foreach ($allPermissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // --- Roles ---

        // Super Admin — all permissions
        /** @var Role $superAdmin */
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions($allPermissions);

        // Assign super_admin to existing test user
        User::where('email', 'admin@example.com')->first()?->assignRole('super_admin');

        // Admin Tenant — tenant-level management
        $adminTenant = Role::firstOrCreate(['name' => 'admin_tenant', 'guard_name' => 'web']);
        $adminTenant->syncPermissions(array_merge(
            $masterDataPermissions,
            $workOrderPermissions,
            $workDataPermissions,
            $dailyWorkPermissions,
            $correspondencePermissions,
            ['dashboard.read', 'reports.read'],
        ));

        // General Manager (GM) — read all, approve escalate
        $gm = Role::firstOrCreate(['name' => 'general_manager', 'guard_name' => 'web']);
        $gm->syncPermissions(array_merge(
            array_map(fn (string $p) => str_replace('.create', '.read', $p), $masterDataPermissions),
            ['work-order.read', 'work-order.review', 'work-order.verify'],
            $workPlanningPermissions,
            $workDataPermissions,
            $dailyWorkPermissions,
            $inventoryPermissions,
            $correspondencePermissions,
            ['dashboard.read', 'reports.read'],
        ));

        // Deputy General Manager (DGM)
        $dgm = Role::firstOrCreate(['name' => 'deputy_general_manager', 'guard_name' => 'web']);
        $dgm->syncPermissions($gm->permissions->pluck('name')->toArray());

        // Head of Department (HOD)
        $hod = Role::firstOrCreate(['name' => 'hod', 'guard_name' => 'web']);
        $hod->syncPermissions(array_merge(
            ['division.read', 'department.read', 'department.update', 'employee.read'],
            ['work-order.read', 'work-order.review', 'work-order.assign', 'work-order.verify'],
            $workPlanningPermissions,
            $workDataPermissions,
            $dailyWorkPermissions,
            $inventoryPermissions,
            $correspondencePermissions,
            ['dashboard.read', 'reports.read'],
        ));

        // Team Leader
        $teamLeader = Role::firstOrCreate(['name' => 'team_leader', 'guard_name' => 'web']);
        $teamLeader->syncPermissions(array_merge(
            ['division.read', 'department.read', 'employee.read'],
            ['work-order.read', 'work-order.review', 'work-order.assign'],
            $workDataPermissions,
            $dailyWorkPermissions,
            ['dashboard.read'],
        ));

        // Karyawan (Requester)
        $karyawan = Role::firstOrCreate(['name' => 'karyawan', 'guard_name' => 'web']);
        $karyawan->syncPermissions(array_merge(
            ['division.read', 'department.read', 'employee.read'],
            ['work-order.create', 'work-order.read', 'work-order.submit'],
            $workDataPermissions,
            ['dashboard.read'],
        ));

        // Field Staff (Karyawan Pelaksana)
        $fieldStaff = Role::firstOrCreate(['name' => 'field_staff', 'guard_name' => 'web']);
        $fieldStaff->syncPermissions(array_merge(
            ['division.read', 'department.read', 'employee.read'],
            ['work-order.read', 'work-order.submit'],
            $workDataPermissions,
            $dailyWorkPermissions,
            ['dashboard.read'],
        ));

        // Staff Surat
        $staffSurat = Role::firstOrCreate(['name' => 'staff_surat', 'guard_name' => 'web']);
        $staffSurat->syncPermissions(array_merge(
            ['division.read', 'department.read', 'employee.read'],
            ['work-order.read'],
            $correspondencePermissions,
            ['dashboard.read'],
        ));

        // Viewer (Auditor)
        $viewer = Role::firstOrCreate(['name' => 'viewer', 'guard_name' => 'web']);
        $viewer->syncPermissions(array_merge(
            array_map(fn (string $p) => str_replace('.create', '.read', $p), $masterDataPermissions),
            array_map(fn (string $p) => str_replace(['.create', '.update', '.delete'], '.read', $p), $workOrderPermissions),
            array_map(fn (string $p) => str_replace('.create', '.read', $p), $workPlanningPermissions),
            array_map(fn (string $p) => str_replace('.create', '.read', $p), $workDataPermissions),
            array_map(fn (string $p) => str_replace('.create', '.read', $p), $dailyWorkPermissions),
            array_map(fn (string $p) => str_replace('.create', '.read', $p), $inventoryPermissions),
            array_map(fn (string $p) => str_replace('.create', '.read', $p), $correspondencePermissions),
            ['dashboard.read', 'reports.read'],
        ));
    }
}
