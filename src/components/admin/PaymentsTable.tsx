import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useListingPayments } from '@/hooks/useListingPayments';
import { DataTable } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { DateRangePicker } from './DateRangePicker';
import { UpdatePaymentStatusDialog } from './UpdatePaymentStatusDialog';

export function PaymentsTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<any>({});
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const { data, isLoading } = useListingPayments(page, filters);

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
      key: 'id',
      label: 'Payment ID',
      render: (item: any) => <span className="font-mono text-xs">{item.id.slice(0, 8)}...</span>,
    },
    {
      key: 'products',
      label: 'Product',
      render: (item: any) => item.products?.title || 'N/A',
    },
    {
      key: 'user_profiles',
      label: 'Seller',
      render: (item: any) => item.public_profiles?.username || 'N/A',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (item: any) => `${item.amount} ${item.currency}`,
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (item: any) => <StatusBadge status={item.payment_status} />,
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
        <Button size="sm" variant="outline" onClick={() => setSelectedPayment(item)}>
          Update Status
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.currency || 'all'}
            onValueChange={(value) => {
              setFilters({ ...filters, currency: value === 'all' ? undefined : value });
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="WLD">WLD</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
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

      {selectedPayment && (
        <UpdatePaymentStatusDialog
          payment={selectedPayment}
          open={!!selectedPayment}
          onOpenChange={(open) => !open && setSelectedPayment(null)}
        />
      )}
    </div>
  );
}
