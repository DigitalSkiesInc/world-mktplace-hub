import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { DataTable } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { DateRangePicker } from './DateRangePicker';
import { SuspendProductDialog } from './SuspendProductDialog';

export function ProductsTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<any>({});
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data, isLoading } = useAdminProducts(page, filters);

  const handleDateChange = (from?: Date, to?: Date) => {
    setFilters({
      ...filters,
      dateFrom: from?.toISOString(),
      dateTo: to?.toISOString(),
    });
    setPage(1);
  };

  const columns = [
    {
      key: 'images',
      label: 'Image',
      render: (item: any) => (
        <img
          src={item.images?.[0] || '/placeholder.svg'}
          alt={item.title}
          className="h-12 w-12 object-cover rounded"
        />
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (item: any) => <span className="line-clamp-2">{item.title}</span>,
    },
    {
      key: 'seller_username',
      label: 'Seller',
    },
    {
      key: 'category_name',
      label: 'Category',
    },
    {
      key: 'price',
      label: 'Price',
      render: (item: any) => `${item.price} ${item.currency}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      key: 'views',
      label: 'Views',
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (item: any) => format(new Date(item.created_at), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: any) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedProduct(item)}>
          Change Status
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => {
              setFilters({ ...filters, status: value === 'all' ? undefined : value });
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>

          <DateRangePicker onDateChange={handleDateChange} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <DataTable
            data={data?.data || []}
            columns={columns}
            currentPage={page}
            totalPages={Math.ceil((data?.total || 0) / 20)}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {selectedProduct && (
        <SuspendProductDialog
          product={selectedProduct}
          open={!!selectedProduct}
          onOpenChange={(open) => !open && setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
