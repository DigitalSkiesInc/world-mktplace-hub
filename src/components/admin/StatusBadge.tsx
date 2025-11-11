import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, { variant: any; label: string }> = {
    active: { variant: 'default', label: 'Active' },
    inactive: { variant: 'secondary', label: 'Inactive' },
    paused: { variant: 'outline', label: 'Paused' },
    sold: { variant: 'secondary', label: 'Sold' },
    suspended: { variant: 'destructive', label: 'Suspended' },
    pending: { variant: 'outline', label: 'Pending' },
    success: { variant: 'default', label: 'Success' },
    failed: { variant: 'destructive', label: 'Failed' },
  };

  const config = variants[status.toLowerCase()] || { variant: 'outline', label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
