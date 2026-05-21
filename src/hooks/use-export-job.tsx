import { QUERIES } from '@/lib/constants'
import { createExportJob, getExportJobById, getExportJobs } from '@/services/export-job'
import type { IRequestPaginationAndSearch } from '@/types/api'
import type { ExportJobType, ICreateExportJobRequest } from '@/types/export-job'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from './use-toast'

export const useCreateExportJob = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [QUERIES.CREATE_EXPORT_JOB],
    mutationFn: async (type: ExportJobType) => {
      const payload: ICreateExportJobRequest = { type }
      return createExportJob(payload)
    },
    onError(error: Error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tạo job xuất file',
        description: error.message,
      })
    },
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: [QUERIES.EXPORT_JOBS] })
      toast({
        variant: 'success',
        title: 'Đã tạo job xuất Excel',
        description: 'Chúng tôi sẽ thông báo khi file sẵn sàng để tải xuống.',
      })
    },
  })
}

export const useExportJobsQuery = (params?: Pick<IRequestPaginationAndSearch, 'page' | 'limit'>) => {
  return useQuery({
    queryKey: [QUERIES.EXPORT_JOBS, params?.page ?? 0, params?.limit ?? 20],
    queryFn: () => getExportJobs(params),
  })
}

export const useExportJobQuery = (jobId?: string, enabled = true) => {
  return useQuery({
    queryKey: [QUERIES.EXPORT_JOB_DETAIL, jobId],
    queryFn: () => getExportJobById(jobId as string),
    enabled: enabled && Boolean(jobId),
  })
}
