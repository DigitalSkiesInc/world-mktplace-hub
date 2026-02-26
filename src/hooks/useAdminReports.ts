import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminReports = () => {
  return useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const { data: reports, error } = await supabase
        .from('product_reports' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch product and reporter details for each report
      const enriched = await Promise.all(
        (reports as any[]).map(async (report: any) => {
          const { data: product } = await supabase
            .from('products_with_sellers')
            .select('*')
            .eq('id', report.product_id)
            .single();

          const { data: reporter } = await supabase
            .from('public_profiles')
            .select('*')
            .eq('id', report.reporter_id)
            .single();

          return {
            ...report,
            product,
            reporter,
          };
        })
      );

      return enriched;
    },
  });
};
