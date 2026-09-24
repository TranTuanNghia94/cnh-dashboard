import { fetchOperationalReport } from '@/services/operational-report'
import { OperationalReportQuery } from '@/types/operational-report'
import { useMutation } from '@tanstack/react-query'
import { useToast } from './use-toast'

export const useOperationalReport = <T>(path: string) => {
  const { toast } = useToast()

  return useMutation({
    mutationKey: ['operational-report', path],
    mutationFn: (query: OperationalReportQuery) => fetchOperationalReport<T>(path, query),
    onError(error: Error) {
      toast({
        variant: 'destructive',
        title: 'Không tải được báo cáo',
        description: error.message,
      })
    },
  })
}
