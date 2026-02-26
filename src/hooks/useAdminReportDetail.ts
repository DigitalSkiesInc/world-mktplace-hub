import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminReportDetail = (reportId: string) => {
  return useQuery({
    queryKey: ['admin-report', reportId],
    queryFn: async () => {
      const { data: report, error } = await supabase
        .from('product_reports' as any)
        .select('*')
        .eq('id', reportId)
        .single();

      if (error) throw error;

      const { data: product } = await supabase
        .from('products_with_sellers')
        .select('*')
        .eq('id', (report as any).product_id)
        .single();

      const { data: reporter } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('id', (report as any).reporter_id)
        .single();

      return {
        ...(report as any),
        product,
        reporter,
      };
    },
    enabled: !!reportId,
  });
};
