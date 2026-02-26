import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { ReportsTable } from '@/components/admin/ReportsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminListings() {
  return (
    <AdminLayout title="Product Listings" subtitle="Manage listings and reports">
      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="listings">
          <ProductsTable />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsTable />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
