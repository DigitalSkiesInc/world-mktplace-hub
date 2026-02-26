import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flag, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminReportDetail } from '@/hooks/useAdminReportDetail';
import { SuspendProductDialog } from '@/components/admin/SuspendProductDialog';

const REASON_LABELS: Record<string, string> = {
  counterfeit: 'Counterfeit / Fake',
  listing_discrepancy: 'Listing Discrepancy',
  fraudulent_activity: 'Fraudulent Activity',
  prohibited_item: 'Prohibited Item',
  suspicious_pricing: 'Suspicious Pricing',
  other: 'Other',
};

export default function AdminReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading } = useAdminReportDetail(id!);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
            </Button>
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-4 text-center py-12">
        <p className="text-muted-foreground">Report not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Report Details</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Report Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flag size={18} className="text-destructive" />
            <span className="font-semibold text-foreground">Report</span>
          </div>
          <Badge variant={report.status === 'pending' ? 'secondary' : 'outline'}>
            {report.status}
          </Badge>
        </div>

        {/* Product Card */}
        {report.product && (
          <div className="bg-card rounded-xl p-4 border border-border space-y-3">
            <h3 className="font-semibold text-foreground text-sm">Reported Product</h3>
            <div className="flex items-center gap-3">
              {report.product.images?.[0] && (
                <img
                  src={report.product.images[0]}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{report.product.title}</p>
                <p className="text-sm text-primary font-semibold">
                  {report.product.price} {report.product.currency}
                </p>
                <p className="text-xs text-muted-foreground">
                  Seller: {report.product.seller_username} · {report.product.category_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {report.product.status}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Report Details */}
        <div className="bg-card rounded-xl p-4 border border-border space-y-4">
          <h3 className="font-semibold text-foreground text-sm">Report Information</h3>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Reason</p>
            <Badge variant="outline">{REASON_LABELS[report.reason] || report.reason}</Badge>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{report.description}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Reported on</p>
            <p className="text-sm text-foreground">
              {new Date(report.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Reporter Info */}
        <div className="bg-card rounded-xl p-4 border border-border space-y-3">
          <h3 className="font-semibold text-foreground text-sm">Reporter</h3>
          <div className="flex items-center gap-2">
            <User size={16} className="text-muted-foreground" />
            <span className="text-sm text-foreground">
              {report.reporter?.username || 'Anonymous'}
            </span>
          </div>
          {report.reporter_contact && (
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">{report.reporter_contact}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {report.product && (
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowSuspendDialog(true)}
          >
            Change Product Status
          </Button>
        )}
      </div>

      {/* Suspend Dialog */}
      {report.product && showSuspendDialog && (
        <SuspendProductDialog
          product={report.product}
          open={showSuspendDialog}
          onOpenChange={setShowSuspendDialog}
        />
      )}
    </div>
  );
}
