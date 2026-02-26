import { useNavigate } from 'react-router-dom';
import { useAdminReports } from '@/hooks/useAdminReports';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const REASON_LABELS: Record<string, string> = {
  counterfeit: 'Counterfeit / Fake',
  listing_discrepancy: 'Listing Discrepancy',
  fraudulent_activity: 'Fraudulent Activity',
  prohibited_item: 'Prohibited Item',
  suspicious_pricing: 'Suspicious Pricing',
  other: 'Other',
};

export function ReportsTable() {
  const { data: reports, isLoading } = useAdminReports();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No product reports yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="hidden sm:table-cell">Seller</TableHead>
            <TableHead className="hidden md:table-cell">Category</TableHead>
            <TableHead className="hidden sm:table-cell">Price</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report: any) => (
            <TableRow
              key={report.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => navigate(`/admin/reports/${report.id}`)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {report.product?.images?.[0] && (
                    <img
                      src={report.product.images[0]}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  )}
                  <span className="font-medium truncate max-w-[120px]">
                    {report.product?.title || 'Unknown'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {report.product?.seller_username || '—'}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {report.product?.category_name || '—'}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {report.product?.price} {report.product?.currency}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {REASON_LABELS[report.reason] || report.reason}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                {new Date(report.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge variant={report.status === 'pending' ? 'secondary' : 'outline'} className="text-xs">
                  {report.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
