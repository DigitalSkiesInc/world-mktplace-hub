import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductsTable } from '@/components/admin/ProductsTable';

export default function AdminListings() {
  return (
    <AdminLayout title="Product Listings" subtitle="Manage all product listings">
      <ProductsTable />
    </AdminLayout>
  );
}
