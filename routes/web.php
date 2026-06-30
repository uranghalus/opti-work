<?php

use App\Http\Controllers\MasterData\DepartmentController;
use App\Http\Controllers\MasterData\DivisionController;
use App\Http\Controllers\MasterData\EmployeeController;
use App\Http\Controllers\MasterData\TenantController;
use App\Http\Controllers\OIDCController;
use App\Http\Controllers\WorkManagament\WorkDataController;
use App\Http\Controllers\WorkManagament\WorkOrderController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Master Data - Tenants
    Route::resource('tenants', TenantController::class);

    // Master Data - Departments
    Route::get('departments', [DepartmentController::class, 'index'])->name('departments.index');
    Route::get('departments/{department}', [DepartmentController::class, 'show'])->name('departments.show');
    Route::post('departments/sync', [DepartmentController::class, 'sync'])->name('departments.sync');

    // Master Data - Divisions
    Route::get('divisions', [DivisionController::class, 'index'])->name('divisions.index');
    Route::post('divisions/sync', [DivisionController::class, 'sync'])->name('divisions.sync');

    // Master Data - Employees
    Route::get('employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('employees/{employee}', [EmployeeController::class, 'show'])->name('employees.show');
    Route::post('employees/sync', [EmployeeController::class, 'sync'])->name('employees.sync');

    // Work Management - Work Orders
    Route::resource('work-orders', WorkOrderController::class);

    // Work Management - Work Data
    Route::resource('work-data', WorkDataController::class);

    // Work Data additional routes
    Route::prefix('work-data')->name('work-data.')->group(function () {
        Route::post('/{work_data}/upload-before-image', [WorkDataController::class, 'uploadBeforeImage'])->name('upload-before-image');
        Route::post('/{work_data}/upload-after-image', [WorkDataController::class, 'uploadAfterImage'])->name('upload-after-image');
        Route::post('/{work_order}/process-to-work-data', [WorkDataController::class, 'processFromWorkOrder'])->name('process-from-work-order');
    });

    // Work Order Workflow Routes
    Route::prefix('work-orders')->name('work-orders.')->group(function () {
        Route::get('/{work_order}/hod-review', [WorkOrderController::class, 'hodReview'])->name('hod-review');
        Route::post('/{work_order}/hod-approve', [WorkOrderController::class, 'hodApprove'])->name('hod-approve');
        Route::get('/{work_order}/assign', [WorkOrderController::class, 'assign'])->name('assign');
        Route::post('/{work_order}/assign', [WorkOrderController::class, 'assignEmployees'])->name('assign.store');
        Route::post('/{work_order}/submit-results', [WorkOrderController::class, 'submitResults'])->name('submit-results');
        Route::post('/{work_order}/verify', [WorkOrderController::class, 'verify'])->name('verify');
    });
});

// Allow guests to start SSO
Route::get('auth/redirect', [OIDCController::class, 'redirect'])->name('authsso');
Route::get('auth/oidc/callback', [OIDCController::class, 'callback'])->name('ssocallback');

require __DIR__.'/settings.php';
