import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateReportParams {
  productId: string;
  reporterId: string;
  reason: string;
  description: string;
  reporterContact?: string;
}

export const useCreateReport = () => {
  return useMutation({
    mutationFn: async (params: CreateReportParams) => {
      const { data, error } = await supabase
        .from('product_reports' as any)
        .insert({
          product_id: params.productId,
          reporter_id: params.reporterId,
          reason: params.reason,
          description: params.description,
          reporter_contact: params.reporterContact || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
  });
};
