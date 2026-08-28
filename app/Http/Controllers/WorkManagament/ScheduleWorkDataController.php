<?php

namespace App\Http\Controllers\WorkManagament;

use App\Http\Controllers\Controller;
use App\Models\ScheduleWorkData;
use App\Models\WorkData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleWorkDataController extends Controller
{
    public function index(Request $request, WorkData $workData)
    {
        $query = $workData->schedules();

        if ($request->filled('status_jadwal')) {
            $query->where('status_jadwal', $request->status_jadwal);
        }

        if ($request->filled('jenis_pekerjaan')) {
            $query->where('jenis_pekerjaan', $request->jenis_pekerjaan);
        }

        $schedules = $query->latest('tgl_jadwal')->paginate(15)->withQueryString();

        return Inertia::render('WorkData/Schedule/Index', [
            'workData' => $workData->load('department'),
            'schedules' => $schedules,
            'filters' => $request->only(['status_jadwal', 'jenis_pekerjaan']),
        ]);
    }

    public function create(WorkData $workData)
    {
        return Inertia::render('WorkData/Schedule/Create', [
            'workData' => $workData->load('department'),
        ]);
    }

    public function store(Request $request, WorkData $workData)
    {
        $validated = $request->validate([
            'tgl_jadwal' => 'required|date|after_or_equal:today',
            'jam_mulai' => 'nullable|string|max:10',
            'jam_selesai' => 'nullable|string|max:10',
            'jenis_pekerjaan' => 'nullable|string|max:100',
            'deskripsi_pekerjaan' => 'nullable|string',
            'lokasi' => 'nullable|string|max:255',
            'status_jadwal' => 'nullable|in:scheduled,in_progress,completed,cancelled,rescheduled',
            'catatan' => 'nullable|string',
        ]);

        $validated['id_work_data'] = $workData->id_work_data;
        $validated['status_jadwal'] = $validated['status_jadwal'] ?? 'scheduled';

        ScheduleWorkData::create($validated);

        return redirect()->route('work-data.schedule.index', $workData)
            ->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function show(WorkData $workData, ScheduleWorkData $schedule)
    {
        return Inertia::render('WorkData/Schedule/Show', [
            'workData' => $workData->load('department'),
            'schedule' => $schedule,
        ]);
    }

    public function edit(WorkData $workData, ScheduleWorkData $schedule)
    {
        return Inertia::render('WorkData/Schedule/Edit', [
            'workData' => $workData->load('department'),
            'schedule' => $schedule,
        ]);
    }

    public function update(Request $request, WorkData $workData, ScheduleWorkData $schedule)
    {
        $validated = $request->validate([
            'tgl_jadwal' => 'required|date',
            'jam_mulai' => 'nullable|string|max:10',
            'jam_selesai' => 'nullable|string|max:10',
            'jenis_pekerjaan' => 'nullable|string|max:100',
            'deskripsi_pekerjaan' => 'nullable|string',
            'lokasi' => 'nullable|string|max:255',
            'status_jadwal' => 'required|in:scheduled,in_progress,completed,cancelled,rescheduled',
            'catatan' => 'nullable|string',
        ]);

        $schedule->update($validated);

        return redirect()->route('work-data.schedule.show', [$workData, $schedule])
            ->with('success', 'Jadwal berhasil diupdate.');
    }

    public function reschedule(Request $request, WorkData $workData, ScheduleWorkData $schedule)
    {
        $validated = $request->validate([
            'tgl_jadwal' => 'required|date|after:today',
            'jam_mulai' => 'nullable|string|max:10',
            'jam_selesai' => 'nullable|string|max:10',
            'catatan' => 'nullable|string',
        ]);

        // Mark old schedule as rescheduled
        $schedule->update(['status_jadwal' => 'rescheduled']);

        // Create new schedule
        $newSchedule = ScheduleWorkData::create([
            'id_work_data' => $workData->id_work_data,
            'tgl_jadwal' => $validated['tgl_jadwal'],
            'jam_mulai' => $validated['jam_mulai'] ?? $schedule->jam_mulai,
            'jam_selesai' => $validated['jam_selesai'] ?? $schedule->jam_selesai,
            'jenis_pekerjaan' => $schedule->jenis_pekerjaan,
            'deskripsi_pekerjaan' => $schedule->deskripsi_pekerjaan,
            'lokasi' => $schedule->lokasi,
            'status_jadwal' => 'scheduled',
            'catatan' => $validated['catatan'] ?? 'Rescheduled from '.$schedule->tgl_jadwal->format('d/m/Y'),
            'rescheduled_from' => $schedule->id_schedule_wd,
        ]);

        return redirect()->route('work-data.schedule.show', [$workData, $newSchedule])
            ->with('success', 'Jadwal berhasil dijadwalkan ulang.');
    }

    public function updateStatus(Request $request, WorkData $workData, ScheduleWorkData $schedule)
    {
        $validated = $request->validate([
            'status_jadwal' => 'required|in:scheduled,in_progress,completed,cancelled',
        ]);

        $schedule->update($validated);

        return back()->with('success', 'Status jadwal berhasil diupdate.');
    }

    public function destroy(WorkData $workData, ScheduleWorkData $schedule)
    {
        $schedule->delete();

        return redirect()->route('work-data.schedule.index', $workData)
            ->with('success', 'Jadwal berhasil dihapus.');
    }
}
