<?php

use App\Http\Controllers\MasterData\DepartmentController;
use App\Http\Controllers\MasterData\DivisionController;
use App\Http\Controllers\MasterData\EmployeeController;
use App\Http\Controllers\MasterData\InventoryController;
use App\Http\Controllers\MasterData\KelompokBarangController;
use App\Http\Controllers\MasterData\TenantController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OIDCController;
use App\Http\Controllers\SamlController;
use App\Http\Controllers\WorkManagament\DashboardController;
use App\Http\Controllers\WorkManagament\ExtendRequestController;
use App\Http\Controllers\WorkManagament\ScheduleWorkDataController;
use App\Http\Controllers\WorkManagament\WorkDailyController;
use App\Http\Controllers\WorkManagament\WorkDataController;
use App\Http\Controllers\WorkManagament\WorkDataPekerjaController;
use App\Http\Controllers\WorkManagament\WorkOrderController;
use App\Http\Controllers\WorkManagament\WorkPlanningController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified', 'ensure.tenant'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Master Data - Tenants
    Route::resource('tenants', TenantController::class);

    // Master Data - Departments (FR-02)
    Route::prefix('departments')->name('departments.')->middleware('permission:department.read')->group(function () {
        Route::get('/', [DepartmentController::class, 'index'])->name('index');
        Route::get('/{department}', [DepartmentController::class, 'show'])->name('show');
        // Sinkronisasi dari Optigate Portal (fr-02) — kewenangan update master data
        Route::post('/sync', [DepartmentController::class, 'sync'])->middleware('permission:department.update')->name('sync');
    });

    // Master Data - Divisions (FR-01)
    Route::prefix('divisions')->name('divisions.')->middleware('permission:division.read')->group(function () {
        Route::get('/', [DivisionController::class, 'index'])->name('index');
        Route::post('/sync', [DivisionController::class, 'sync'])->middleware('permission:division.update')->name('sync');
    });

    // Master Data - Employees (FR-03)
    Route::prefix('employees')->name('employees.')->middleware('permission:employee.read')->group(function () {
        Route::get('/', [EmployeeController::class, 'index'])->name('index');
        Route::get('/{employee}', [EmployeeController::class, 'show'])->name('show');
        Route::post('/sync', [EmployeeController::class, 'sync'])->middleware('permission:employee.update')->name('sync');
    });

    // Work Management - Work Orders (FR-05..FR-08)
    Route::prefix('work-orders')->name('work-orders.')->middleware('permission:work-order.read')->group(function () {
        Route::get('/', [WorkOrderController::class, 'index'])->name('index');
        Route::get('/create', [WorkOrderController::class, 'create'])->middleware('permission:work-order.create')->name('create');
        Route::post('/', [WorkOrderController::class, 'store'])->middleware('permission:work-order.create')->name('store');
        Route::get('/{work_order}', [WorkOrderController::class, 'show'])->name('show');
        Route::get('/{work_order}/edit', [WorkOrderController::class, 'edit'])->middleware('permission:work-order.update')->name('edit');
        Route::put('/{work_order}', [WorkOrderController::class, 'update'])->middleware('permission:work-order.update')->name('update');
        Route::delete('/{work_order}', [WorkOrderController::class, 'destroy'])->middleware('permission:work-order.delete')->name('destroy');

        // Workflow review/assign/verify (FR-07/FR-08)
        Route::get('/{work_order}/hod-review', [WorkOrderController::class, 'hodReview'])->middleware('permission:work-order.review')->name('hod-review');
        Route::post('/{work_order}/hod-approve', [WorkOrderController::class, 'hodApprove'])->middleware('permission:work-order.review')->name('hod-approve');
        Route::get('/{work_order}/assign', [WorkOrderController::class, 'assign'])->middleware('permission:work-order.assign')->name('assign');
        Route::post('/{work_order}/assign', [WorkOrderController::class, 'assignEmployees'])->middleware('permission:work-order.assign')->name('assign.store');
        Route::get('/{work_order}/submit-results', [WorkOrderController::class, 'showSubmitResults'])->middleware('permission:work-order.submit')->name('submit-results');
        Route::post('/{work_order}/submit-results', [WorkOrderController::class, 'submitResults'])->middleware('permission:work-order.submit')->name('submit-results.store');
        Route::get('/{work_order}/verify', [WorkOrderController::class, 'showVerify'])->middleware('permission:work-order.verify')->name('verify');
        Route::post('/{work_order}/verify', [WorkOrderController::class, 'verify'])->middleware('permission:work-order.verify')->name('verify.store');
    });

    // Extend Work Order (FR-10) — pengajuan oleh pemilik WO, approval TL/HOD di-route oleh controller
    Route::get('/work-orders/{work_order}/extend', [ExtendRequestController::class, 'create'])->middleware('permission:work-order.submit')->name('work-orders.extend');
    Route::post('/work-orders/{work_order}/extend', [ExtendRequestController::class, 'store'])->middleware('permission:work-order.submit')->name('work-orders.extend.store');
    Route::post('/extend-requests/{extend_request}/approve-tl', [ExtendRequestController::class, 'approveTl'])->middleware('permission:work-order.review')->name('extend-requests.approve-tl');
    Route::post('/extend-requests/{extend_request}/reject-tl', [ExtendRequestController::class, 'rejectTl'])->middleware('permission:work-order.review')->name('extend-requests.reject-tl');
    Route::post('/extend-requests/{extend_request}/approve-hod', [ExtendRequestController::class, 'approveHod'])->middleware('permission:work-order.review')->name('extend-requests.approve-hod');
    Route::post('/extend-requests/{extend_request}/reject-hod', [ExtendRequestController::class, 'rejectHod'])->middleware('permission:work-order.review')->name('extend-requests.reject-hod');
    Route::get('/extend-requests/pending', [ExtendRequestController::class, 'pending'])->middleware('permission:work-order.review')->name('extend-requests.pending');

    // Work Management - Work Data (FR-15)
    // parameter() menyamakan nama param URI dengan variabel controller agar implicit binding bekerja
    Route::prefix('work-data')->name('work-data.')->middleware('permission:work-data.read')->group(function () {
        Route::get('/', [WorkDataController::class, 'index'])->name('index');
        Route::get('/create', [WorkDataController::class, 'create'])->middleware('permission:work-data.create')->name('create');
        Route::post('/', [WorkDataController::class, 'store'])->middleware('permission:work-data.create')->name('store');
        Route::get('/{workData}', [WorkDataController::class, 'show'])->name('show');
        Route::get('/{workData}/edit', [WorkDataController::class, 'edit'])->middleware('permission:work-data.update')->name('edit');
        Route::put('/{workData}', [WorkDataController::class, 'update'])->middleware('permission:work-data.update')->name('update');
        Route::delete('/{workData}', [WorkDataController::class, 'destroy'])->middleware('permission:work-data.delete')->name('destroy');

        Route::post('/{workData}/upload-before-image', [WorkDataController::class, 'uploadBeforeImage'])->middleware('permission:work-data.update')->name('upload-before-image');
        Route::post('/{workData}/upload-after-image', [WorkDataController::class, 'uploadAfterImage'])->middleware('permission:work-data.update')->name('upload-after-image');
    });

    // Process Work Order to Work Data (lanjutan alur review HOD)
    Route::post('/work-data/{work_order}/process-to-work-data', [WorkDataController::class, 'processFromWorkOrder'])
        ->middleware('permission:work-data.create')
        ->name('work-data.process-from-work-order');

    // Work Data - Worker Allocation (FR-16)
    Route::prefix('work-data/{workData}/pekerja')->name('work-data.pekerja.')->group(function () {
        Route::get('/', [WorkDataPekerjaController::class, 'index'])->middleware('permission:work-data.read')->name('index');
        Route::get('/create', [WorkDataPekerjaController::class, 'create'])->middleware('permission:work-data.update')->name('create');
        Route::post('/', [WorkDataPekerjaController::class, 'store'])->middleware('permission:work-data.update')->name('store');
        Route::get('/{pekerja}/edit', [WorkDataPekerjaController::class, 'edit'])->middleware('permission:work-data.update')->name('edit');
        Route::put('/{pekerja}', [WorkDataPekerjaController::class, 'update'])->middleware('permission:work-data.update')->name('update');
        Route::patch('/{pekerja}/status', [WorkDataPekerjaController::class, 'updateStatus'])->middleware('permission:work-data.update')->name('update-status');
        Route::delete('/{pekerja}', [WorkDataPekerjaController::class, 'destroy'])->middleware('permission:work-data.update')->name('destroy');
    });

    // Work Data - Schedule Management (FR-17)
    Route::prefix('work-data/{workData}/schedule')->name('work-data.schedule.')->group(function () {
        Route::get('/', [ScheduleWorkDataController::class, 'index'])->middleware('permission:work-data.read')->name('index');
        Route::get('/create', [ScheduleWorkDataController::class, 'create'])->middleware('permission:work-data.update')->name('create');
        Route::post('/', [ScheduleWorkDataController::class, 'store'])->middleware('permission:work-data.update')->name('store');
        Route::get('/{schedule}', [ScheduleWorkDataController::class, 'show'])->middleware('permission:work-data.read')->name('show');
        Route::get('/{schedule}/edit', [ScheduleWorkDataController::class, 'edit'])->middleware('permission:work-data.update')->name('edit');
        Route::put('/{schedule}', [ScheduleWorkDataController::class, 'update'])->middleware('permission:work-data.update')->name('update');
        Route::patch('/{schedule}/status', [ScheduleWorkDataController::class, 'updateStatus'])->middleware('permission:work-data.update')->name('update-status');
        Route::post('/{schedule}/reschedule', [ScheduleWorkDataController::class, 'reschedule'])->middleware('permission:work-data.update')->name('reschedule');
        Route::delete('/{schedule}', [ScheduleWorkDataController::class, 'destroy'])->middleware('permission:work-data.update')->name('destroy');
    });

    // Work Management - Work Planning (FR-12/13/14)
    Route::prefix('work-planning')->name('work-planning.')->middleware('permission:work-planning.read')->group(function () {
        Route::get('/', [WorkPlanningController::class, 'index'])->name('index');
        Route::get('/create', [WorkPlanningController::class, 'create'])->middleware('permission:work-planning.create')->name('create');
        Route::post('/', [WorkPlanningController::class, 'store'])->middleware('permission:work-planning.create')->name('store');
        Route::get('/{work_planning}', [WorkPlanningController::class, 'show'])->name('show');
        Route::get('/{work_planning}/edit', [WorkPlanningController::class, 'edit'])->middleware('permission:work-planning.update')->name('edit');
        Route::put('/{work_planning}', [WorkPlanningController::class, 'update'])->middleware('permission:work-planning.update')->name('update');
        Route::post('/{work_planning}/extend', [WorkPlanningController::class, 'requestExtend'])->middleware('permission:work-planning.update')->name('extend');
        Route::post('/{work_planning}/extend/approve', [WorkPlanningController::class, 'approveExtend'])->name('extend.approve');
        Route::post('/{work_planning}/extend/reject', [WorkPlanningController::class, 'rejectExtend'])->name('extend.reject');
        Route::delete('/{work_planning}', [WorkPlanningController::class, 'destroy'])->middleware('permission:work-planning.delete')->name('destroy');
    });

    // Daily Work Management (FR-21/22)
    Route::prefix('work-daily')->name('work-daily.')->middleware('permission:daily-work.read')->group(function () {
        Route::get('/', [WorkDailyController::class, 'index'])->name('index');
        Route::get('/create', [WorkDailyController::class, 'create'])->middleware('permission:daily-work.create')->name('create');
        Route::post('/', [WorkDailyController::class, 'store'])->middleware('permission:daily-work.create')->name('store');
        Route::patch('/{work_daily}/status', [WorkDailyController::class, 'updateStatus'])->middleware('permission:daily-work.update')->name('update-status');
        Route::delete('/{work_daily}', [WorkDailyController::class, 'destroy'])->middleware('permission:daily-work.create')->name('destroy');
    });

    // Inventory Management (FR-23/24) & Kelompok Barang
    Route::prefix('inventory')->name('inventory.')->middleware('permission:inventory.read')->group(function () {
        Route::get('/', [InventoryController::class, 'index'])->name('index');
        Route::get('/create', [InventoryController::class, 'create'])->middleware('permission:inventory.create')->name('create');
        Route::post('/', [InventoryController::class, 'store'])->middleware('permission:inventory.create')->name('store');
        Route::get('/{inventory}', [InventoryController::class, 'show'])->name('show');
        Route::get('/{inventory}/edit', [InventoryController::class, 'edit'])->middleware('permission:inventory.update')->name('edit');
        Route::put('/{inventory}', [InventoryController::class, 'update'])->middleware('permission:inventory.update')->name('update');
        Route::delete('/{inventory}', [InventoryController::class, 'destroy'])->middleware('permission:inventory.delete')->name('destroy');
    });

    Route::prefix('kelompok-barang')->name('kelompok-barang.')->middleware('permission:kelompok-barang.read')->group(function () {
        Route::get('/', [KelompokBarangController::class, 'index'])->name('index');
        Route::post('/', [KelompokBarangController::class, 'store'])->middleware('permission:kelompok-barang.create')->name('store');
        Route::put('/{kelompok_barang}', [KelompokBarangController::class, 'update'])->middleware('permission:kelompok-barang.update')->name('update');
        Route::delete('/{kelompok_barang}', [KelompokBarangController::class, 'destroy'])->middleware('permission:kelompok-barang.delete')->name('destroy');
    });

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // RBAC routes moved to settings.php with permission middleware

});

// Allow guests to start SSO
Route::get('auth/redirect', [OIDCController::class, 'redirect'])->name('authsso');
Route::get('auth/oidc/callback', [OIDCController::class, 'callback'])->name('ssocallback');

Route::get('saml/acs', [SamlController::class, 'redirect'])->name('samlacs');
require __DIR__ . '/settings.php';
