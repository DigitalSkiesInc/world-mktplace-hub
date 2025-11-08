import { AdminLayout } from '@/components/admin/AdminLayout';
import { PaymentsTable } from '@/components/admin/PaymentsTable';

export default function AdminPayments() {
  return (
    <AdminLayout title="Listing Payments" subtitle="Manage payment transactions">
      <PaymentsTable />
    </AdminLayout>
  );
}
