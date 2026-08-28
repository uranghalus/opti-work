import { Head } from '@inertiajs/react';
import { WorkerForm } from './Create';
type WorkDataWithDept = { id_work_data: number; no_kerja: string; department?: { nama_department: string } | null };
type WorkDataPekerja = { id_work_data_pekerja: number; id_work_data: number; id_employee: string | null; id_user: number | null; role_pekerja: string; status_alokasi: string; catatan: string | null; accepted_at: string | null; completed_at: string | null; employee?: { nama_employee: string } | null; user?: { name: string } | null };
export default function PekerjaEdit({ workData, pekerja }: { workData: WorkDataWithDept; pekerja: WorkDataPekerja }) { return <><Head title={`Edit Worker - ${workData.no_kerja}`} /><WorkerForm workData={workData} pekerja={pekerja} /></>; }
PekerjaEdit.layout = { breadcrumbs: [{ title: 'Work Data', href: '/work-data' }, { title: 'Workers', href: '' }, { title: 'Edit', href: '' }] };
