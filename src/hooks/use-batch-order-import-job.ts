import { QUERIES } from '@/lib/constants'
import { normalizeBatchOrderImportSummary } from '@/lib/batch-order-import-notification'
import { getBatchOrderImportJob } from '@/services/order'
import type { IBatchOrderImportSummary } from '@/types/batch-order-import'
import { useQuery } from '@tanstack/react-query'

export const useBatchOrderImportJob = (jobId: string | null, enabled: boolean) => {
  return useQuery({
    queryKey: [QUERIES.BATCH_ORDER_IMPORT_JOB, jobId],
    queryFn: async () => {
      if (!jobId) return null
      const response = await getBatchOrderImportJob(jobId)
      return response?.data ?? null
    },
    enabled: enabled && Boolean(jobId),
    select: (job): IBatchOrderImportSummary | null => {
      if (!job) return null
      return normalizeBatchOrderImportSummary(job.resultSummary)
    },
  })
}
