import { AdminLayout } from '@/components/admin/AdminLayout';
import { CategoryManager } from '@/components/admin/CategoryManager';

export default function AdminCategories() {
  return (
    <AdminLayout title="Categories" subtitle="Manage product categories">
      <CategoryManager />
    </AdminLayout>
  );
}
