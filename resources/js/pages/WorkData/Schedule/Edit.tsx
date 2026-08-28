import { ScheduleForm } from './Create';
type WorkDataWithDept = { id_work_data: number; no_kerja: string; department?: { nama_department: string } | null };
type ScheduleWorkData = { id_schedule_wd: number; id_work_data: number; tgl_jadwal: string; jam_mulai: string | null; jam_selesai: string | null; jenis_pekerjaan: string | null; deskripsi_pekerjaan: string | null; lokasi: string | null; status_jadwal: string; catatan: string | null; rescheduled_from: number | null };
export default function ScheduleEdit({ workData, schedule }: { workData: WorkDataWithDept; schedule: ScheduleWorkData }) { return <ScheduleForm workData={workData} schedule={schedule} />; }
ScheduleEdit.layout = { breadcrumbs: [{ title: 'Work Data', href: '/work-data' }, { title: 'Schedules', href: '' }, { title: 'Edit', href: '' }] };
