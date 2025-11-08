import { AdminLayout } from '@/components/admin/AdminLayout';
import { ConfigurationPanel } from '@/components/admin/ConfigurationPanel';

export default function AdminConfig() {
  return (
    <AdminLayout title="Configuration" subtitle="Manage platform settings">
      <ConfigurationPanel />
    </AdminLayout>
  );
}
