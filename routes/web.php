<?php

use App\Http\Controllers\MasterData\DepartmentController;
use App\Http\Controllers\MasterData\DivisionController;
use App\Http\Controllers\MasterData\EmployeeController;
use App\Http\Controllers\MasterData\TenantController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OIDCController;
use App\Http\Controllers\WorkManagament\DashboardController;
use App\Http\Controllers\WorkManagament\ExtendRequestController;
use App\Http\Controllers\WorkManagament\ScheduleWorkDataController;
use App\Http\Controllers\WorkManagament\WorkDataController;
use App\Http\Controllers\WorkManagament\WorkDataPekerjaController;
use App\Http\Controllers\WorkManagament\WorkOrderController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified', 'ensure.tenant'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

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

    // Work Data - Worker Allocation (FR-16)
    Route::prefix('work-data/{workData}')->name('work-data.pekerja.')->group(function () {
        Route::get('pekerja', [WorkDataPekerjaController::class, 'index'])->name('index');
        Route::get('pekerja/create', [WorkDataPekerjaController::class, 'create'])->name('create');
        Route::post('pekerja', [WorkDataPekerjaController::class, 'store'])->name('store');
        Route::get('pekerja/{pekerja}/edit', [WorkDataPekerjaController::class, 'edit'])->name('edit');
        Route::put('pekerja/{pekerja}', [WorkDataPekerjaController::class, 'update'])->name('update');
        Route::patch('pekerja/{pekerja}/status', [WorkDataPekerjaController::class, 'updateStatus'])->name('update-status');
        Route::delete('pekerja/{pekerja}', [WorkDataPekerjaController::class, 'destroy'])->name('destroy');
    });

    // Work Data - Schedule Management (FR-17)
    Route::prefix('work-data/{workData}')->name('work-data.schedule.')->group(function () {
        Route::get('schedule', [ScheduleWorkDataController::class, 'index'])->name('index');
        Route::get('schedule/create', [ScheduleWorkDataController::class, 'create'])->name('create');
        Route::post('schedule', [ScheduleWorkDataController::class, 'store'])->name('store');
        Route::get('schedule/{schedule}', [ScheduleWorkDataController::class, 'show'])->name('show');
        Route::get('schedule/{schedule}/edit', [ScheduleWorkDataController::class, 'edit'])->name('edit');
        Route::put('schedule/{schedule}', [ScheduleWorkDataController::class, 'update'])->name('update');
        Route::patch('schedule/{schedule}/status', [ScheduleWorkDataController::class, 'updateStatus'])->name('update-status');
        Route::post('schedule/{schedule}/reschedule', [ScheduleWorkDataController::class, 'reschedule'])->name('reschedule');
        Route::delete('schedule/{schedule}', [ScheduleWorkDataController::class, 'destroy'])->name('destroy');
    });

    // Work Order Workflow Routes
    Route::prefix('work-orders')->name('work-orders.')->group(function () {
        Route::get('/{work_order}/hod-review', [WorkOrderController::class, 'hodReview'])->name('hod-review');
        Route::post('/{work_order}/hod-approve', [WorkOrderController::class, 'hodApprove'])->name('hod-approve');
        Route::get('/{work_order}/assign', [WorkOrderController::class, 'assign'])->name('assign');
        Route::post('/{work_order}/assign', [WorkOrderController::class, 'assignEmployees'])->name('assign.store');
        Route::get('/{work_order}/submit-results', [WorkOrderController::class, 'showSubmitResults'])->name('submit-results');
        Route::post('/{work_order}/submit-results', [WorkOrderController::class, 'submitResults'])->name('submit-results.store');
        Route::get('/{work_order}/verify', [WorkOrderController::class, 'showVerify'])->name('verify');
        Route::post('/{work_order}/verify', [WorkOrderController::class, 'verify'])->name('verify.store');
    });

    // Extend Work Order Routes
    Route::get('/work-orders/{work_order}/extend', [ExtendRequestController::class, 'create'])->name('work-orders.extend');
    Route::post('/work-orders/{work_order}/extend', [ExtendRequestController::class, 'store'])->name('work-orders.extend.store');
    Route::post('/extend-requests/{extend_request}/approve-tl', [ExtendRequestController::class, 'approveTl'])->name('extend-requests.approve-tl');
    Route::post('/extend-requests/{extend_request}/reject-tl', [ExtendRequestController::class, 'rejectTl'])->name('extend-requests.reject-tl');
    Route::post('/extend-requests/{extend_request}/approve-hod', [ExtendRequestController::class, 'approveHod'])->name('extend-requests.approve-hod');
    Route::post('/extend-requests/{extend_request}/reject-hod', [ExtendRequestController::class, 'rejectHod'])->name('extend-requests.reject-hod');
    Route::get('/extend-requests/pending', [ExtendRequestController::class, 'pending'])->name('extend-requests.pending');

    // Notifications
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // RBAC routes moved to settings.php with permission middleware

});

// Allow guests to start SSO
Route::get('auth/redirect', [OIDCController::class, 'redirect'])->name('authsso');
Route::get('auth/oidc/callback', [OIDCController::class, 'callback'])->name('ssocallback');

require __DIR__.'/settings.php';
